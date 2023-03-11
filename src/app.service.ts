import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as tokenJson from './assets/MyToken.json'
import { PaymentOrder } from './models/paymentOrder.model'; 
//import * as dotenv from 'dotenv';
//dotenv.config();


//contract Address and Network
const CONTRACT_ADDRESS = 
  "0x18dF1C9a5c9A7A35c251818Eec22ccaf3905fe3D"
const NETWORK = "maticmum"

@Injectable()
export class AppService {
  provider: ethers.providers.Provider;
  contract: ethers.Contract;

  paymentOrders: PaymentOrder[];

  constructor(){
    this.provider = new ethers.providers.InfuraProvider(
      NETWORK,
      process.env.INFURA_API_KEY
    );
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      tokenJson.abi,
      this.provider
    )
    this.paymentOrders = [];
  }

  getContractAddress(): string {
    return this.contract.address;
  }

  async getTotalSupply(): Promise<number> {
    const totalSupplyBN = await this.contract.totalSupply();
    const totalSupplyString = ethers.utils.formatEther(totalSupplyBN);
    // better way for small numbers supply
    const totalSupplyNumber = Math.round(parseFloat(totalSupplyString) * (10 ** 18))
    //const totalSupplyNumber = parseFloat(totalSupplyString);
    return totalSupplyNumber;
  }
  
  async getAllowance(from: string, to: string):
  Promise<number> {
    const allowanceBN = await this.contract.allowance(
      from,
      to
    );
    const allowanceString = ethers.utils.formatEther(allowanceBN);
    //const allowanceNumber = Math.round(parseFloat(allowanceString) * (10 ** 18));
    const allowanceNumber = parseFloat(allowanceString);
    return allowanceNumber;
  }

  async getTransactionStatus(hash: string): Promise<string> {
    const tx = await this.provider.getTransaction(hash);
    const txRecipt = await tx.wait();
    return txRecipt.status == 1 ? "Completed" : "Reverted";
  }

  getPaymentOrders(){
    return this.paymentOrders;
  }

  createPaymentOrder(value: number, secret : string) {
    const newPaymentOrder = new PaymentOrder();
    newPaymentOrder.value = value;
    newPaymentOrder.secret = secret;
    newPaymentOrder.id = this.paymentOrders.length;
    this.paymentOrders.push(newPaymentOrder);
    return newPaymentOrder.id;
  }

  //ToDo
  //fulfillPaymentOrder(id: number, secret: string, address: string){
  //  //Check if the secret is correct
  //  //pick the pkey from env
  //  //bvuild a signer
  //  //connect signer to the contract
  //  //call the mint function passing value to mint to address
  //}

}
