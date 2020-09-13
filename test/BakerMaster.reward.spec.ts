import {BigNumber} from 'ethers/utils'
import {expect} from 'chai'

const bakeStartBlock = new BigNumber(4).mul(new BigNumber(10).pow(17)) // 一块0.4个
const startBlock = new BigNumber(1).mul(new BigNumber(10).pow(7))
const bonusEndBlock = startBlock.add(900000)
const bonusBeforeBulkBlockSize = new BigNumber(30000)
const bonusEndBulkBlockSize: BigNumber = bonusEndBlock.sub(startBlock)
// 0.01
const bonusBeforeCommonDifference = new BigNumber(300).mul(new BigNumber(10).pow(18)).div(bonusBeforeBulkBlockSize)
console.log('bonusBeforeCommonDifference ' + bonusBeforeCommonDifference)
// 0.005
const bonusEndCommonDifference = new BigNumber(150)
  .mul(30)
  .mul(new BigNumber(10).pow(18))
  .div(bonusEndBlock.sub(startBlock))
console.log('bonusEndCommonDifference ' + bonusEndCommonDifference)
// 0.11
const bakeBonusEndBlock: BigNumber = bakeStartBlock
  .sub(
    bonusEndBlock
      .sub(startBlock)
      .div(bonusBeforeBulkBlockSize)
      .sub(1)
      .mul(bonusBeforeCommonDifference)
  )
  .mul(bonusBeforeBulkBlockSize)
  .mul(bonusEndBulkBlockSize.div(bonusBeforeBulkBlockSize))
  .div(bonusEndBulkBlockSize)

console.log('bakeBonusEndBlock  ' + bakeBonusEndBlock)
const maxRewardBlockNumber: BigNumber = startBlock.add(
  bonusEndBulkBlockSize.mul(bakeBonusEndBlock.div(bonusEndCommonDifference).add(1))
)

// (_from,_to]
const getTotalRewardInfoInSameCommonDifference = (
  _from: BigNumber,
  _to: BigNumber,
  _bakeInitBlock: BigNumber,
  _bulkBlockSize: BigNumber,
  _commonDifference: BigNumber
): BigNumber => {
  if (maxRewardBlockNumber.lte(_from)) {
    return new BigNumber(0)
  }
  if (maxRewardBlockNumber.lt(_to)) {
    _to = maxRewardBlockNumber
  }
  console.log('_from ' + _from)
  console.log('_to ' + _to)
  console.log('_bakeInitBlock ' + _bakeInitBlock)
  console.log('_bulkBlockSize ' + _bulkBlockSize)
  console.log('_commonDifference ' + _commonDifference)
  console.log('startBlock ' + startBlock)
  console.log('maxRewardBlockNumber ' + maxRewardBlockNumber)
  let currentBulkNumber = _to
    .sub(startBlock)
    .div(_bulkBlockSize)
    .add(
      _to
        .sub(startBlock)
        .mod(_bulkBlockSize)
        .gt(new BigNumber(0))
        ? 1
        : 0
    )
  if (currentBulkNumber.lt(1)) {
    currentBulkNumber = new BigNumber(1)
  }
  console.log('currentBulkNumber ' + currentBulkNumber)
  let fromBulkNumber = _from
    .sub(startBlock)
    .div(_bulkBlockSize)
    .add(
      _from
        .sub(startBlock)
        .mod(_bulkBlockSize)
        .gt(new BigNumber(0))
        ? 1
        : 0
    )
  if (fromBulkNumber.lt(1)) {
    fromBulkNumber = new BigNumber(1)
  }
  if (fromBulkNumber.eq(currentBulkNumber)) {
    return _to.sub(_from).mul(_bakeInitBlock.sub(currentBulkNumber.sub(1).mul(_commonDifference)))
  }

  const lastRewardBulkLastBlock = startBlock.add(_bulkBlockSize.mul(fromBulkNumber))
  console.log('lastRewardBulkLastBlock ' + lastRewardBulkLastBlock)

  const currentPreviousBulkLastBlock = startBlock.add(_bulkBlockSize.mul(currentBulkNumber.sub(1)))
  console.log('currentPreviousBulkLastBlock ' + currentPreviousBulkLastBlock)

  let totalReward = _to
    .sub(_from.gt(currentPreviousBulkLastBlock) ? _from : currentPreviousBulkLastBlock)
    .mul(_bakeInitBlock.sub(currentBulkNumber.sub(1).mul(_commonDifference)))
  console.log('last block create bake ' + _bakeInitBlock.sub(currentBulkNumber.sub(1).mul(_commonDifference)))
  console.log('totalReward ' + totalReward)

  if (lastRewardBulkLastBlock.gt(_from) && lastRewardBulkLastBlock.lte(_to)) {
    let diff = lastRewardBulkLastBlock
      .sub(_from)
      .mul(_bakeInitBlock.sub(fromBulkNumber.gt(0) ? fromBulkNumber.sub(1).mul(_commonDifference) : 0))
    totalReward = totalReward.add(diff)
    console.log('diff ' + diff)
  }
  console.log('totalReward ' + totalReward)

  if (currentPreviousBulkLastBlock.gt(lastRewardBulkLastBlock)) {
    // sum( [fromBulkNumber+1, currentBulkNumber] )
    // 1/2 * N *( a1 + aN)
    const N = currentPreviousBulkLastBlock.sub(lastRewardBulkLastBlock).div(_bulkBlockSize)
    if (N.gt(1)) {
      console.log('N ' + N)
      const a1 = _bulkBlockSize.mul(
        _bakeInitBlock.sub(
          lastRewardBulkLastBlock
            .sub(startBlock)
            .mul(_commonDifference)
            .div(_bulkBlockSize)
        )
      )
      const aN = _bulkBlockSize.mul(
        _bakeInitBlock.sub(
          currentPreviousBulkLastBlock
            .sub(startBlock)
            .div(_bulkBlockSize)
            .sub(1)
            .mul(_commonDifference)
        )
      )
      const diff = N.mul(a1.add(aN)).div(2)
      totalReward = totalReward.add(diff)
      console.log('a1 ' + a1)
      console.log('aN ' + aN)
      console.log('diff ' + diff)
    } else {
      const diff = _bulkBlockSize.mul(_bakeInitBlock.sub(currentBulkNumber.sub(2).mul(_commonDifference)))
      totalReward = totalReward.add(diff)
      console.log('diff ' + diff)
    }
  }
  console.log('totalReward ' + totalReward)
  return totalReward
}
const getTotalRewardInfo = (_from: BigNumber, _to: BigNumber): BigNumber => {
  let totalReward: BigNumber
  if (_to.lte(bonusEndBlock)) {
    totalReward = getTotalRewardInfoInSameCommonDifference(
      _from,
      _to,
      bakeStartBlock,
      bonusBeforeBulkBlockSize,
      bonusBeforeCommonDifference
    )
  } else if (_from.gte(bonusEndBlock)) {
    totalReward = getTotalRewardInfoInSameCommonDifference(
      _from,
      _to,
      bakeBonusEndBlock,
      bonusEndBulkBlockSize,
      bonusEndCommonDifference
    )
  } else {
    totalReward = getTotalRewardInfoInSameCommonDifference(
      _from,
      bonusEndBlock,
      bakeStartBlock,
      bonusBeforeBulkBlockSize,
      bonusBeforeCommonDifference
    ).add(
      getTotalRewardInfoInSameCommonDifference(
        bonusEndBlock,
        _to,
        bakeBonusEndBlock,
        bonusEndBulkBlockSize,
        bonusEndCommonDifference
      )
    )
  }
  return totalReward
}

describe('BakeryMaster', () => {
  it('getReward', () => {
    console.log('bonusEndBulkBlockSize: ' + bonusEndBulkBlockSize)
    console.log('bakeBonusEndBlock: ' + bakeBonusEndBlock)
    console.log('maxRewardBlockNumber: ' + maxRewardBlockNumber)
    console.log('totalBlocks: ' + maxRewardBlockNumber.sub(startBlock))
    let from = startBlock
    from = startBlock.add(30000 + 3)
    let to = bonusEndBlock
    to = startBlock.add(120000 - 1)
    // to = bonusEndBlock.sub(1);
    let bakeInitBlock = bakeStartBlock
    let bulkBlockSize = bonusBeforeBulkBlockSize
    let commonDifference = bonusBeforeCommonDifference
    console.log('--------------------------')
    console.log('from ' + from)
    console.log('to ' + to)
    console.log('bakeInitBlock ' + bakeInitBlock)
    console.log('bulkBlockSize ' + bulkBlockSize)
    console.log('commonDifference ' + commonDifference)
    let totalReward = getTotalRewardInfoInSameCommonDifference(from, to, bakeInitBlock, bulkBlockSize, commonDifference)
    console.log('getTotalRewardInfoInSameCommonDifference: ' + totalReward)
    totalReward = getTotalRewardInfo(from, to)
    console.log('getTotalRewardInfo: ' + totalReward)
    totalReward = getTotalRewardInfo(startBlock.add(900000), startBlock.add(900001))
    console.log('getTotalRewardInfo: ' + totalReward)
    totalReward = getTotalRewardInfo(startBlock.add(900000 - 1), startBlock.add(900001))
    console.log('getTotalRewardInfo: ' + totalReward)
  })

  it('getTotalRewardInfoInSameCommonDifference', () => {
    // (startBlock, startBlock+29999]
    let totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock,
      startBlock.add(29999),
      bakeStartBlock,
      bonusBeforeBulkBlockSize,
      bonusBeforeCommonDifference
    )
    console.log('getTotalRewardInfoInSameCommonDifference 1: ' + totalReward)
    // 0.4 * 29999 = 11999.6
    expect(totalReward).to.eq(new BigNumber(119996).mul(new BigNumber(10).pow(17)))
    //  (startBlock, startBlock+30000]
    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock,
      startBlock.add(30000),
      bakeStartBlock,
      bonusBeforeBulkBlockSize,
      bonusBeforeCommonDifference
    )
    console.log('getTotalRewardInfoInSameCommonDifference 2: ' + totalReward)
    expect(totalReward).to.eq(new BigNumber(12).mul(new BigNumber(10).pow(21)))
    // (startBlock+30003, startBlock+59999)
    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock.add(30000 + 3),
      startBlock.add(60000 - 1),
      bakeStartBlock,
      bonusBeforeBulkBlockSize,
      bonusBeforeCommonDifference
    )
    console.log('getTotalRewardInfoInSameCommonDifference 3: ' + totalReward)
    // (10030003,10059999] (0.4-0.01)*(10059999-10030003) = 11698.44
    expect(totalReward).to.eq(new BigNumber(1169844).mul(new BigNumber(10).pow(16)))
    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock.add(30000 + 3),
      startBlock.add(90000 - 1),
      bakeStartBlock,
      bonusBeforeBulkBlockSize,
      bonusBeforeCommonDifference
    )
    console.log('getTotalRewardInfoInSameCommonDifference 4: ' + totalReward)
    // (10030003, 10060000] 29997 (10060000,10089999] 29999
    // (0.4-0.01)*(10060000-10030003)+(0.4-0.02)*(10089999-10060000) = 11698.83 + 11399.62 = 23098.45
    expect(totalReward).to.eq(new BigNumber(2309845).mul(new BigNumber(10).pow(16)))
    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock.add(30000 + 3),
      startBlock.add(120000 - 1),
      bakeStartBlock,
      bonusBeforeBulkBlockSize,
      bonusBeforeCommonDifference
    )
    console.log('getTotalRewardInfoInSameCommonDifference 5: ' + totalReward)
    // (10030003, 10060000] 29997 (10060000,10090000] 30000  (10090000,10119999] 29999
    // (0.4-0.01)*29997+(0.4-0.02)*30000+(0.4-0.03)*(29999) = 11698.83 + 11400 + 11099.63= 34198.46
    expect(totalReward).to.eq(new BigNumber(3419846).mul(new BigNumber(10).pow(16)))
    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock.add(30000 + 3),
      startBlock.add(150000 - 1),
      bakeStartBlock,
      bonusBeforeBulkBlockSize,
      bonusBeforeCommonDifference
    )
    console.log('getTotalRewardInfoInSameCommonDifference 6: ' + totalReward)
    // (10030003, 10060000] 29997 (10060000,10090000] 30000  (10090000,10120000] 30000  (10120000,10149999] 29999
    // (0.4-0.01)*(10060000-10030003)+(0.4-0.02)*30000+(0.4-0.03)*30000+(0.4-0.04)*(10149999-10120000)
    // 11698.83 + (11400 + 11100 ) + 10799.64
    // 11698.83 + 22500 + 10799.64 = 44998.47
    expect(totalReward).to.eq(new BigNumber(4499847).mul(new BigNumber(10).pow(16)))
    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock.add(900000),
      startBlock.add(900000 + 1),
      bakeBonusEndBlock,
      bonusEndBulkBlockSize,
      bonusEndCommonDifference
    )
    // (10900000,10900001] 1
    // (0.11-0.005)*1 = 0.105
    console.log('getTotalRewardInfoInSameCommonDifference 7: ' + totalReward)
    expect(totalReward).to.eq(new BigNumber(105).mul(new BigNumber(10).pow(15)))
    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock.add(900000),
      startBlock.add(1800000 + 1),
      bakeBonusEndBlock,
      bonusEndBulkBlockSize,
      bonusEndCommonDifference
    )
    // (10900000,11800000] 900000 (11800000,11800001]
    // (0.11-0.005)*900000 + (0.11-0.01)*1 = 94500.1
    console.log('getTotalRewardInfoInSameCommonDifference 8: ' + totalReward)
    expect(totalReward).to.eq(new BigNumber(945001).mul(new BigNumber(10).pow(17)))
    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock.add(new BigNumber(1).mul(900000)),
      startBlock.add(new BigNumber(3).mul(900000).sub(1)),
      bakeBonusEndBlock,
      bonusEndBulkBlockSize,
      bonusEndCommonDifference
    )
    // (10900000,11800000] 900000 (11800000,12699999] 899999
    // (0.11-0.005)*900000+(0.11-0.01)*899999 = 184499.9
    console.log('getTotalRewardInfoInSameCommonDifference 9: ' + totalReward)
    expect(totalReward).to.eq(new BigNumber(1844999).mul(new BigNumber(10).pow(17)))
    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock.add(new BigNumber(1).mul(900000)),
      startBlock.add(new BigNumber(4).mul(900000).sub(1)),
      bakeBonusEndBlock,
      bonusEndBulkBlockSize,
      bonusEndCommonDifference
    )
    // (10900000,11800000] 900000 (11800000,12700000] 900000 (12700000,13599999] 899999
    // (0.11-0.005)*900000+(0.11-0.01)*900000+(0.11-0.015)*899999=269999.905
    console.log('getTotalRewardInfoInSameCommonDifference 10: ' + totalReward)
    expect(totalReward).to.eq(new BigNumber(269999905).mul(new BigNumber(10).pow(15)))
    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock.add(new BigNumber(1).mul(900000)),
      startBlock.add(new BigNumber(29).mul(900000)),
      bakeBonusEndBlock,
      bonusEndBulkBlockSize,
      bonusEndCommonDifference
    )
    console.log('getTotalRewardInfoInSameCommonDifference 11: ' + totalReward)
    expect(totalReward).to.eq(new BigNumber(1039500).mul(new BigNumber(10).pow(18)))
    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock.add(new BigNumber(1).mul(900000)),
      startBlock.add(new BigNumber(30).mul(900000)),
      bakeBonusEndBlock,
      bonusEndBulkBlockSize,
      bonusEndCommonDifference
    )
    console.log('getTotalRewardInfoInSameCommonDifference 12: ' + totalReward)
    expect(totalReward).to.eq(new BigNumber(1039500).mul(new BigNumber(10).pow(18)))
    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock.add(new BigNumber(1).mul(900000)),
      startBlock.add(new BigNumber(2).mul(900000).sub(1)),
      bakeBonusEndBlock,
      bonusEndBulkBlockSize,
      bonusEndCommonDifference
    )
    // (0.11-0.005)*899999=94499.895
    console.log('getTotalRewardInfoInSameCommonDifference 13: ' + totalReward)
    expect(totalReward).to.eq(new BigNumber(94499895).mul(new BigNumber(10).pow(15)))

    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock.add(new BigNumber(11).mul(900000)),
      startBlock.add(new BigNumber(12).mul(900000)),
      bakeBonusEndBlock,
      bonusEndBulkBlockSize,
      bonusEndCommonDifference
    )
    console.log('getTotalRewardInfoInSameCommonDifference 14: ' + totalReward)
    expect(totalReward).to.eq(new BigNumber(495).mul(new BigNumber(10).pow(20)))
    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock.add(new BigNumber(11).mul(900000)),
      startBlock.add(new BigNumber(12).mul(900000).sub(1)),
      bakeBonusEndBlock,
      bonusEndBulkBlockSize,
      bonusEndCommonDifference
    )
    console.log('getTotalRewardInfoInSameCommonDifference 15: ' + totalReward)
    expect(totalReward).to.eq(new BigNumber(49499945).mul(new BigNumber(10).pow(15)))
    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock.add(new BigNumber(21).mul(900000)),
      startBlock.add(new BigNumber(22).mul(900000)),
      bakeBonusEndBlock,
      bonusEndBulkBlockSize,
      bonusEndCommonDifference
    )
    console.log('getTotalRewardInfoInSameCommonDifference 16: ' + totalReward)
    expect(totalReward).to.eq(new BigNumber(45).mul(new BigNumber(10).pow(20)))
    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock.add(new BigNumber(21).mul(900000)),
      startBlock.add(new BigNumber(22).mul(900000).sub(1)),
      bakeBonusEndBlock,
      bonusEndBulkBlockSize,
      bonusEndCommonDifference
    )
    console.log('getTotalRewardInfoInSameCommonDifference 17: ' + totalReward)
    expect(totalReward).to.eq(new BigNumber(4499995).mul(new BigNumber(10).pow(15)))
    totalReward = getTotalRewardInfoInSameCommonDifference(
      startBlock.add(new BigNumber(22).mul(900000)),
      startBlock.add(new BigNumber(23).mul(900000).sub(1)),
      bakeBonusEndBlock,
      bonusEndBulkBlockSize,
      bonusEndCommonDifference
    )
    console.log('getTotalRewardInfoInSameCommonDifference 18: ' + totalReward)
    expect(totalReward).to.eq(new BigNumber(0))
  })

  it('getTotalRewardInfo', () => {
    let totalReward = getTotalRewardInfo(startBlock, bonusEndBlock)
    console.log('getTotalRewardInfo 1: ' + totalReward)
    expect(totalReward).to.eq(new BigNumber(229500).mul(new BigNumber(10).pow(18)))
    totalReward = getTotalRewardInfo(startBlock, maxRewardBlockNumber.add(100))
    expect(totalReward).to.eq(new BigNumber(1269000).mul(new BigNumber(10).pow(18)))
    console.log('getTotalRewardInfo 2: ' + totalReward)
    const getNextEndBlock = (currentStartBlock: BigNumber): BigNumber => {
      if (currentStartBlock.gt(bonusEndBlock)) {
        return new BigNumber(Math.floor(Math.random() * (1000000 - 100000) + 100000))
      } else {
        return new BigNumber(Math.floor(Math.random() * (40000 - 10000) + 10000))
      }
    }
    // Mock the mining process
    let tempStartBlock = startBlock
    let tempEndBlock = startBlock.add(10000)
    let tempTotalReward = getTotalRewardInfo(tempStartBlock, tempEndBlock)
    let sumTempTotalReward = tempTotalReward
    console.error(
      'getTotalRewardInfo: ' + tempStartBlock + ',' + tempEndBlock + ', ' + tempTotalReward + ', ' + sumTempTotalReward
    )
    while (tempEndBlock.lte(maxRewardBlockNumber)) {
      tempStartBlock = tempEndBlock
      tempEndBlock = tempEndBlock.add(getNextEndBlock(tempEndBlock))
      tempTotalReward = getTotalRewardInfo(tempStartBlock, tempEndBlock)
      sumTempTotalReward = sumTempTotalReward.add(tempTotalReward)
      console.error(
        'getTotalRewardInfo: ' +
          tempStartBlock +
          ',' +
          tempEndBlock +
          ', ' +
          tempTotalReward +
          ', ' +
          sumTempTotalReward
      )
    }
    expect(totalReward).to.eq(sumTempTotalReward)
  })
})
