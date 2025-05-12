import styles from "../styles/Navbar.module.css";
import { ChevronDownIcon } from '@heroicons/react/outline'
import { TransactionContext } from './TransactionContext'
import { useContext } from 'react'
import { shortenAddress } from '../utils/shortenAddress'

const Navbar = () => {
    const { currentAccount, connectWallet } = useContext(TransactionContext)

    return <nav className={styles.navigationContainer}>
        <div className={styles.container}>
            <div className={styles.logoContainer}>
                <img 
                src='../assets/billmycrypto-logo.png'
                alt='BillMyCrypto Logo'
                className={styles.logoImage}
                />
            </div>
            {currentAccount ? (
                <div className={styles.actionContainer}>
                <p>
                  Hello, <span className={styles.accentColor}>{shortenAddress(currentAccount)}</span>👋
                  <ChevronDownIcon className={styles.arrowDownIcon} />
                </p>
                
                <div className={styles.avatarContainer}>
                    <img className={styles.avatarImage}
                    src='https://avatars.githubusercontent.com/u/30671464?s=400&u=4df0936e186a4c3da73d35f87786cea9877a68eb&v=4'
                    alt=''
                    />
                </div>
                  
            </div>
            ) : (
                <button /*className= {styles.connectBtn}*/ onClick={connectWallet}>
                 Connect Wallet
                </button>
            )}

        </div>
    </nav>
}

export default Navbar