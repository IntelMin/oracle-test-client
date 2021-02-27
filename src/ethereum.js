require("dotenv").config();

import Web3 from "web3";

// const web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER_ADDRESS));
const web3 = new Web3(process.env.WEB3_PROVIDER_ADDRESS);
const abi = JSON.parse(process.env.ABI);
const address = process.env.CONTRACT_ADDRESS;
// const contract = web3.eth.contract(abi).at(address);
const contract = new web3.eth.Contract(abi, address);
const private_keys = [
];

const sendMethod = (privateKey, encodedABI) => {
  return new Promise((resolve, reject) => {
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    var tx = {
      from: account.address,
      to: address,
      gas: 1000000,
      data: encodedABI,
    };
    console.log("Calling smart contract from ", account.address);
    const signPromise = web3.eth.accounts.signTransaction(tx, privateKey);
    signPromise.then((signedTx) => {
      const sentTx = web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
      sentTx.on("receipt", receipt => {
        resolve(receipt);
      });
      sentTx.on("error", err => {
        reject(err);
      });
    }).catch((err) => {
      reject(err);
    });
  });
}

export const createRequest = ({
  urlToQuery,
  attributeToFetch
}) => {
  return new Promise((resolve, reject) => {
    const privateKey = private_keys[process.env.ACCOUNT_NUMBER];
    var encodedABI = contract.methods.newChainRequest(urlToQuery, attributeToFetch).encodeABI();
    sendMethod(privateKey, encodedABI)
      .then(resolve)
      .catch(reject)
  });
};

export const updateRequest = (index) => ({
  id,
  valueRetrieved
}) => {
  return new Promise((resolve, reject) => {
    const privateKey = private_keys[index];
    var encodedABI = contract.methods.updatedChainRequest(id, valueRetrieved).encodeABI();
    sendMethod(privateKey, encodedABI)
      .then(resolve)
      .catch(reject)
  });   
};

export const getRating = (address) => {
  return new Promise((resolve, reject) => {
    const privateKey = private_keys[process.env.ACCOUNT_NUMBER];
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    console.log("Calling smart contract from ", account.address);
    contract.methods.getRating(address).call({
      from: account,
      gas: 600000
    })
    .then(resolve)
    .catch(reject);
  });
};

export const newRequest = (callback) => {
  contract.events.OffChainRequest((error, result) => callback(error, result));
};

export const updatedRequest = (callback) => {
  contract.events.UpdatedRequest((error, result) => callback(error, result));
};