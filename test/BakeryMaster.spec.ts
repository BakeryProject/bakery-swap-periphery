import chai from 'chai'
import * as ethers from 'ethers'
import {deployContract, solidity} from 'ethereum-waffle'
import {expandTo18Decimals, getCreate2Address} from './shared/utilities'

import BakeryMaster from '../build/BakeryMaster.json'
import BEP20 from '../build/IBEP20.json'
import {MaxUint256} from 'ethers/constants'

chai.use(solidity)

describe('BakeryMaster', () => {
  const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545')
  //  const provider = ethers.getDefaultProvider('rinkeby')
  const privateKey = ''
  const wallet = new ethers.Wallet(privateKey, provider)

  let overrides = {
    //        3022211
    gasLimit: 9999999
  }

  const bakeryMasterAddress = '0x4b221a21e1152c2aeEB6f43a9E50A174Ae34Ac4c'

  beforeEach(async () => {
    let gasPrice = await provider.getGasPrice()
    console.log(`current gas Price ${gasPrice}`)
    gasPrice = gasPrice.mul(3)
    console.log(`new gas Price ${gasPrice}`)
    overrides = Object.assign(overrides, {gasPrice: gasPrice.toNumber()})
  })
  it('poolLength', async () => {
    const bakeryToken = new ethers.Contract(bakeryMasterAddress, JSON.stringify(BakeryMaster.abi), provider).connect(
      wallet
    )
    const poolLength = await bakeryToken.poolLength()
    console.log(`poolLength ${poolLength}`)
  })

  it('massUpdatePools', async () => {
    const bakeryToken = new ethers.Contract(bakeryMasterAddress, JSON.stringify(BakeryMaster.abi), provider).connect(
      wallet
    )
    const tx = await bakeryToken.massUpdatePools()
    console.log(`massUpdatePools ${tx.hash}`)
    await tx.wait()
  })

  it('updatePool', async () => {
    const bakeryToken = new ethers.Contract(bakeryMasterAddress, JSON.stringify(BakeryMaster.abi), provider).connect(
      wallet
    )
    // const tx = await bakeryToken.updatePool('0x809142af759a8c39ab12f85ade543ed8bd3f164b')
    // 0x3dec41b6dd3876a5e08ebaafbcd7b3cca73885e2cc76fe2ddca8feb338cfe405
    const tx = await bakeryToken.updatePool('0x2A942b802258F50810d4914cF2E5c4f9446Da36a')

    console.log(`updatePool ${tx.hash}`)
    await tx.wait()
  })

  it('add', async () => {
    const bakeryToken = new ethers.Contract(bakeryMasterAddress, JSON.stringify(BakeryMaster.abi), provider).connect(
      wallet
    )
    const tx = await bakeryToken.add(1, '0x809142af759a8c39ab12f85ade543ed8bd3f164b', false, {
      ...overrides,
      value: 0
    })
    console.log(`add ${tx.hash}`)
    //  弄错了 0x16dd188d7f0ec52f567a993023bf46a69fb31e29e7bbeb345b414295e25e273d
    // ETH TCT 0x3b69a9b8578619e7c6273eab85df7e82df54cb08709b68955f2f6a654b042f41
    // 0xb921c053c60c5dd56d92e207d5616a0870334bfdca7e77e1fb2a20b5135314dc
    await tx.wait()
  })

  it('set', async () => {
    const bakeryToken = new ethers.Contract(bakeryMasterAddress, JSON.stringify(BakeryMaster.abi), provider).connect(
      wallet
    )
    const tx = await bakeryToken.set('0x2A942b802258F50810d4914cF2E5c4f9446Da36a', 0, false, {
      ...overrides,
      value: 0
    })
    console.log(`set ${tx.hash}`)
    await tx.wait()
    // 0x9c3346e7c831ffa4a6b66d52d95c043baff274cf245b4f31e725e1433379907e
  })
})
