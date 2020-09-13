import chai from 'chai'
import * as ethers from 'ethers'
import {deployContract, solidity} from 'ethereum-waffle'
import {expandTo18Decimals, getCreate2Address} from './shared/utilities'

import BakerySwapRouter from '../build/BakerySwapRouter.json'
import BakerySwapPair from '@BakeryProject/bakery-swap-core/build/BakerySwapPair.json'
import BakeryToken from '../build/BakeryToken.json'
import BakeryMaster from '../build/BakeryMaster.json'
import BEP20 from '../build/IBEP20.json'
import {MaxUint256} from 'ethers/constants'
import {BigNumber} from 'ethers/utils'

chai.use(solidity)

describe('BakerySwapRouter', () => {
  const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545')
  //  const provider = ethers.getDefaultProvider('rinkeby')
  const privateKey = ''
  const wallet = new ethers.Wallet(privateKey, provider)

  let overrides = {
    //        3022211
    gasLimit: 9999999
  }

  const factoryAddress = '0x9A0615b24C8064F26A3030507c2B5f0DB7F975b4'
  const bakeryTokenAddress = '0x026FE7a3f029F4A2983d31c610b8FACD94e84f6f'
  const bakeryMasterAddress = '0x4b221a21e1152c2aeEB6f43a9E50A174Ae34Ac4c'
  const wbnbAddress = '0x094616f0bdfb0b526bd735bf66eca0ad254ca81f'
  const routeAddress = '0x2A942b802258F50810d4914cF2E5c4f9446Da36a'
  const tctAddress = '0xEEa705FDCFe84775A22062043aef1D4cF90A6337'
  const faiAddress = '0x3be02b05ae44e52adfd51e85a30de209c4184051'

  beforeEach(async () => {
    let gasPrice = await provider.getGasPrice()
    console.log(`current gas Price ${gasPrice}`)
    gasPrice = gasPrice.mul(3)
    console.log(`new gas Price ${gasPrice}`)
    overrides = Object.assign(overrides, {gasPrice: gasPrice.toNumber()})
  })

  it('getCreate2Address', function() {
    let create2Address = getCreate2Address(
      '0x569f6163E8453f0d404D8cA3A06367094cF2c97D',
      ['0xc778417e063141139fce010982780140aa0cd5ab', '0xEEa705FDCFe84775A22062043aef1D4cF90A6337'],
      `0x${BakerySwapPair.evm.bytecode.object}`
    )
    console.log(`${create2Address}`)
    // 0xdef8c40e2f47a2222fc4b7b2caba3bcf5fda57d9
  })

  it('init code hash', function() {
    const hash = ethers.utils.keccak256(`0x${BakerySwapPair.evm.bytecode.object}`)
    console.log(hash)
    // 0x5ae9ee982df425710823a8b85d98fec3f9c2be462baf6fa6a220c2bd87385760
  })

  it('deployBakeryToken', async () => {
    console.log(`start deployContract BakeryToken`)
    const bakeryToken = await deployContract(wallet, BakeryToken, [], overrides)
    console.log(`contract BakeryToken address ${bakeryToken.address}`)
    console.log(`contract BakeryToken deploy transaction hash ${bakeryToken.deployTransaction.hash}`)
    await bakeryToken.deployed()
    console.log(`finish deployContract BakeryToken`)
    /**
     * start deployContract BakeryToken
     contract BakeryToken address 0x97196EBee68c58bb2d7D70b71cdDf2C93B9E3216
     contract BakeryToken deploy transaction hash 0xeb15e6bb9fcb8bf2558c5684fd900747c652c6e4f947d2e1f70563a627624d6d
     finish deployContract BakeryToken
     */
  })

  it('deployBakeryMaster', async () => {
    console.log(`start deployContract BakeryMaster`)
    const devAddress = '0xf9e89b5aCA2e6061d22EA98CBCc2d826E3f9E4b1'
    const bakeStartBlock = new BigNumber(4).mul(new BigNumber(10).pow(17)) // 一块0.4个
    const startBlock = new BigNumber(1815200)
    const bonusEndBlock = startBlock.add(900000)
    const bonusBeforeBulkBlockSize = new BigNumber(30000)
    const bonusEndBulkBlockSize: BigNumber = bonusEndBlock.sub(startBlock)
    // 0.005
    const bonusBeforeCommonDifference = new BigNumber(300).mul(new BigNumber(10).pow(18)).div(bonusBeforeBulkBlockSize)
    console.log('bonusBeforeCommonDifference ' + bonusBeforeCommonDifference)
    // 0.0003 0.009
    const bonusEndCommonDifference = new BigNumber(150)
      .mul(30)
      .mul(new BigNumber(10).pow(18))
      .div(bonusEndBlock.sub(startBlock))
    const bakeryMaster = await deployContract(
      wallet,
      BakeryMaster,
      [
        bakeryTokenAddress,
        devAddress,
        bakeStartBlock,
        startBlock,
        bonusEndBlock,
        bonusBeforeBulkBlockSize,
        bonusBeforeCommonDifference,
        bonusEndCommonDifference
      ],
      overrides
    )
    console.log(`contract BakeryMaster address ${bakeryMaster.address}`)
    console.log(`contract BakeryMaster deploy transaction hash ${bakeryMaster.deployTransaction.hash}`)
    await bakeryMaster.deployed()
    console.log(`finish deployContract BakeryMaster`)
    /**
     * start deployContract BakeryMaster
     contract BakeryMaster address 0x8fBb5d22Da828c453843435FBc5E83800d121560
     contract BakeryMaster deploy transaction hash 0x94f2b602942933ab729f83538e43efdcf33d5b41c3c3cf99068ef8ed75058971
     finish deployContract BakeryMaster

     // 0xaf0E97C1a44d8d2cB529301859c3a0cD3E8340f0
     */
  })

  it('deployBakerySwapRouter', async () => {
    console.log(`start deployContract BakerySwapRouter`)
    const bakerySwapRouter = await deployContract(wallet, BakerySwapRouter, [factoryAddress, wbnbAddress], overrides)
    console.log(`contract BakerySwapRouter address ${bakerySwapRouter.address}`)
    console.log(`contract BakerySwapRouter deploy transaction hash ${bakerySwapRouter.deployTransaction.hash}`)
    await bakerySwapRouter.deployed()
    console.log(`finish deployContract BakerySwapRouter`)
    /**
     * start deployContract BakerySwapRouter
     contract BakerySwapRouter address 0x9Dc6617335b1b3e8C5859004D783FD041C42320a
     contract BakerySwapRouter deploy transaction hash 0x419919f03f9ac28a2b3e38e76984c263ef3b52ad2800b0e48698d779dd7ee2de
     finish deployContract BakerySwapRouter

     */
  })

  it('transferBakeryTokenOwnershipToBakeryMaster', async () => {
    const bakeryToken = new ethers.Contract(bakeryTokenAddress, JSON.stringify(BakeryToken.abi), provider).connect(
      wallet
    )
    const tx = await bakeryToken.transferOwnership(bakeryMasterAddress, {
      ...overrides,
      value: 0
    })
    console.log(`transferBakeryTokenOwnershipToBakeryMaster ${tx.hash}`)
    await tx.wait()
    // 0x8dc1c3eb682efb9db7f3aa21284da0c47286a8b32e52ad85844be8c956bd86c2
  })
})
