
import { useAccount } from 'wagmi';
import './App.css'
import Header from './component/Header';
import WalletConnectButton from './component/WalletConnectButton';


function App() {

  const {isConnected, address} = useAccount();

  return (
    <div>
    <Header />
    <WalletConnectButton />
        <h1 className="text-white ">Hello World</h1>
    </div>
  )
}

export default App
