import { FeatureSteps } from "./feature/feature"

const features = [
  { 
    step: 'Step 1', 
    title: 'Connect Your Wallet',
    content: 'Start your trading journey with AXYZ by connecting your Solana wallet securely.', 
 
  },
  { 
    step: 'Step 2',
    title: 'Discover Trading Pairs',
    content: 'Explore a wide range of trading pairs with real-time market data and analytics.',
  
  },
  {
    step: 'Step 3',
    title: 'Place Your Orders',
    content: 'Place your orders with ease using our intuitive interface and secure wallet authentication.',
    

  }]
export function FeaturesSection() {
  return (
      <FeatureSteps 
        features={features.map(feature => ({
          ...feature,
          image: '/placeholder-image.jpg' // Add a default image path
        }))}
        title="Trading Made Simple"
        autoPlayInterval={4000}
        imageHeight="h-[500px]"
      />
  )
}