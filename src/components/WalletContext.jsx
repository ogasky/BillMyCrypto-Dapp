import { useEffect, useState, createContext } from "react";
import { ethers } from "ethers";

export const WalletContext = createContext()

const { ethereum } = window

export const WalletProvider = ({ children }) => {
    const [ currentAccount, setCurrentAccount ] = useState('')

    useEffect(() => {
        checkIfWalletIsConnected()
    }, [])
    
    const checkIfWalletIsConnected = async () => {
        try {
          if(!ethereum) {
             return alert('Please install Metamask')  
           }

           const accounts = await ethereum.request({method:
            "eth_requestAccounts"})
            if (accounts.length) {
                setCurrentAccount(accounts[0])
            } else {
                console.log('No accounts found')
            }

        } catch (error) {
            console.log(error)
        }
    }

    const connectWallet = async () => {
        try {
            if(!ethereum) {
                return alert('Please install Metamask')  
              }
              const accounts = await ethereum.request({ method:
                'eth_requestAccounts' })
                setCurrentAccount(accounts[0])
                window.location.reload()
        } catch (error) {
            console.log(error)
            throw new Error('No ethereum object')
        }
    }

    return (
        <WalletContext.Provider value={{ connectWallet, currentAccount }}>
            {children}
        </WalletContext.Provider>
    )
}