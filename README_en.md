# Monad Testnet Smart Contract Interaction

A professional web application built with React + Vite + Tailwind CSS for interacting with smart contracts on the Monad Testnet.

## Features

- **Clean and Responsive UI**: Minimal and modern design using Tailwind CSS and shadcn/ui
- **100 Smart Contract Interactions**: Ability to sequentially interact with a list of smart contracts
- **Real-time Feedback**: Display the status of each transaction in real-time
- **Error Handling**: Comprehensive error handling system with message display
- **Loading Indicators**: Visual indicators for progress and loading status
- **Comprehensive Statistics**: Display the number of successful and failed transactions

## Technologies Used

- **React 19**: JavaScript library for building user interfaces
- **Vite**: Fast build tool and local development server
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **shadcn/ui**: Ready-to-use and customizable UI components
- **Ethers.js**: Library for interacting with the blockchain
- **Lucide React**: A collection of modern icons

## Installation and Running

### Prerequisites
- Node.js (version 18 or later)
- pnpm (package manager)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd monad-contract-interaction
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the local server**
   ```bash
   pnpm run dev
   ```

4. **Open the application**
   Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
pnpm run build
```

Production files will be generated in the `dist/` folder.

## How to Use

1. **Connect to Network**: The application will attempt to connect to MetaMask or use a JSON-RPC provider.
2. **Start Interaction**: Click the "Start Interaction with 100 Different Contracts" button.
3. **Monitor Progress**: Observe real-time progress with statistics and results.
4. **Stop Process**: The process can be stopped at any time by clicking the stop button.

## Monad Testnet Setup

To use the application with the actual Monad Testnet:

1. **Add Network to MetaMask**:
   - Network Name: Monad Testnet
   - RPC URL: `https://testnet-rpc.monad.xyz` (replace with the correct RPC)
   - Chain ID: (Enter the correct Chain ID)
   - Currency Symbol: MON

2. **Get Test Tokens**: Use the Monad Testnet faucet.

3. **Update Contract Addresses**: Update the `CONTRACT_ADDRESSES` list in `src/App.jsx` with actual contract addresses.

## Project Structure

```
monad-contract-interaction/
├── public/                 # Public files
├── src/
│   ├── components/         # React components
│   │   └── ui/            # shadcn UI components
│   ├── assets/            # Static assets
│   ├── App.jsx            # Main component
│   ├── App.css            # Application styles
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html             # Main HTML file
├── package.json           # Project dependencies
├── vite.config.js         # Vite configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a new branch for your feature or fix
3. Commit your changes
4. Submit a Pull Request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue in the repository.

