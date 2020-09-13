import {Wallet, Contract} from 'ethers'
import {Web3Provider} from 'ethers/providers'
import {deployContract} from 'ethereum-waffle'

import {expandTo18Decimals} from './utilities'

import SwapFactory from '@BakeryProject/bakery-swap-core/build/BakerySwapFactory.json'
import ISwapPair from '@BakeryProject/bakery-swap-core/build/IBakerySwapPair.json'

import BEP20 from '../../build/BEP20.json'
import WBNB from '../../build/WBNB.json'
import SwapRouter from '../../build/BakerySwapRouter.json'
import RouterEventEmitter from '../../build/RouterEventEmitter.json'

const overrides = {
  gasLimit: 9999999
}

interface Fixture {
  token0: Contract
  token1: Contract
  wbnb: Contract
  wbnbPartner: Contract
  factory: Contract
  router: Contract
  routerEventEmitter: Contract
  pair: Contract
  wbnbPair: Contract
}

export async function Fixture(provider: Web3Provider, [wallet]: Wallet[]): Promise<Fixture> {
  // deploy tokens
  const tokenA = await deployContract(wallet, BEP20, [expandTo18Decimals(10000)])
  const tokenB = await deployContract(wallet, BEP20, [expandTo18Decimals(10000)])
  const wbnb = await deployContract(wallet, WBNB)
  const wbnbPartner = await deployContract(wallet, BEP20, [expandTo18Decimals(10000)])

  // deploy factory
  const factory = await deployContract(wallet, SwapFactory, [wallet.address])

  // deploy routers
  const router = await deployContract(wallet, SwapRouter, [factory.address, wbnb.address], overrides)

  // event emitter for testing
  const routerEventEmitter = await deployContract(wallet, RouterEventEmitter, [])

  // initialize
  await factory.createPair(tokenA.address, tokenB.address)
  const pairAddress = await factory.getPair(tokenA.address, tokenB.address)
  const pair = new Contract(pairAddress, JSON.stringify(ISwapPair.abi), provider).connect(wallet)

  const token0Address = await pair.token0()
  const token0 = tokenA.address === token0Address ? tokenA : tokenB
  const token1 = tokenA.address === token0Address ? tokenB : tokenA

  await factory.createPair(wbnb.address, wbnbPartner.address)
  const wbnbPairAddress = await factory.getPair(wbnb.address, wbnbPartner.address)
  const wbnbPair = new Contract(wbnbPairAddress, JSON.stringify(ISwapPair.abi), provider).connect(wallet)

  return {
    token0,
    token1,
    wbnb,
    wbnbPartner,
    factory,
    router,
    routerEventEmitter,
    pair,
    wbnbPair
  }
}
