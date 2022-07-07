import { useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import NFTTile from "./NFTTile";
import { useEffect } from "react";

export default function Profile ({address, appProvider, chainId}) {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    // const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState("0");
    const params = useParams();

    useEffect(() => {
        async function getNFTData(tokenId) {
            if (!appProvider || address === "0x") {
                return
            }
            const ethers = require("ethers");
            let sumPrice = 0;
            const provider = new ethers.providers.Web3Provider(appProvider);
            const signer = provider.getSigner();
            // console.log("signer: ", signer);
            // const addr = await signer.getAddress();
            // console.log(("Address: ", addr));
    
            //Pull the deployed contract instance
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
            let transaction = await contract.getMyNFTs()
            console.log("transaction: ", transaction);
    
            const items = await Promise.all(transaction.map(async i => {
                console.log("getNFTData => i.tokenId: ", i.tokenId, "i: ", i);
                const tokenURI = await contract.tokenURI(i.tokenId);
                console.log("tokenURI: ", tokenURI);
                let meta = await axios.get(tokenURI);
                meta = meta.data;
    
                let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
                let item = {
                    price,
                    tokenId: i.tokenId.toNumber(),
                    seller: i.seller,
                    owner: i.owner,
                    image: meta.image,
                    name: meta.name,
                    description: meta.description,
                }
                sumPrice += Number(price);
                return item;
            }))
    
            updateData(items);
            updateFetched(true);
            // updateAddress(addr);
            updateTotalPrice(sumPrice.toPrecision(3));
        }
        
        const tokenId = params.tokenId;
        // console.log("tokenId: ", tokenId, "params: ", params);
        getNFTData(tokenId);


    }, [address, chainId, appProvider]);

    return (
        <div className="profileClass" style={{"min-height":"100vh"}}>
            <div className="profileClass">
                <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
                    <div className="mb-5">
                        <h2 className="font-bold">Wallet Address</h2>  
                        {address === "0x" ? <h3>Please connect your wallet</h3> : <h3>{address}</h3>}
                    </div>
                </div>
                {!dataFetched ?  <div className="flex text-center flex-col mt-11 md:text-2xl text-white">Loading... </div>: 
                    <div>
                        <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
                            <div>
                                <h2 className="font-bold">No. of NFTs</h2>
                                {data.length}
                            </div>
                            <div className="ml-20">
                                <h2 className="font-bold">Total Value</h2>
                                {totalPrice} ETH
                            </div>
                        </div>
                        <div className="flex flex-col text-center items-center mt-11 text-white">
                            <h2 className="font-bold">Your NFTs</h2>
                        <div className="flex justify-center flex-wrap max-w-screen-xl">
                            {data.map((value, index) => {
                            return <NFTTile data={value} key={index}></NFTTile>;
                            })}
                        </div>
                        <div className="mt-10 text-xl">
                            {data.length === 0 ? "Oops, No NFT data to display (Are you logged in?)":""}
                        </div>
                    </div>
                 </div>
                }

            </div>
        </div>
    )
};