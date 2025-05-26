
import { useAccount } from 'wagmi';
import './App.css'
import Header from './component/Header';
import WalletConnectButton from './component/WalletConnectButton';
import TokenDisplay from './component/TokenDisplay';


function App() {

  const {isConnected, address} = useAccount();

  return (
    <div>
    <Header />
    <WalletConnectButton />
    <TokenDisplay tokenAddress={"0xf5A89adC619a89271d0da903778e6EA54e8Da06f"}/>
        <h1 className="text-white ">Hello World</h1>
    </div>
  )
}

export default App
