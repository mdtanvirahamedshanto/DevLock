import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { PlanModel } from '../src/database/models/plan.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devlock';

// Ensure the URI does not contain the replicaSet query param for standalone testing
const cleanMongoUri = MONGO_URI.replace(/([?&])replicaSet=[^&]+(&|$)/, '$1').replace(/\?$/, '');

const plans = [
  {
    key: 'free',
    name: 'Free',
    description: 'Perfect for small side projects',
    price: 0,
    currency: 'USD',
    features: ['Up to 5 Projects', 'Basic Analytics', 'Community Support'],
    maxProjects: 5,
    isPopular: false,
    isActive: true,
  },
  {
    key: 'starter',
    name: 'Starter',
    description: 'For growing indie hackers',
    price: 20,
    currency: 'USD',
    features: ['Unlimited Projects', 'Advanced Analytics', 'Priority Support', 'Custom Branding'],
    maxProjects: 20,
    isPopular: true,
    isActive: true,
  },
  {
    key: 'business',
    name: 'Business',
    description: 'For serious businesses and teams',
    price: 50,
    currency: 'USD',
    features: ['Everything in Starter', 'Dedicated Account Manager', 'White-labeling', '99.9% Uptime SLA'],
    maxProjects: 9999,
    isPopular: false,
    isActive: true,
  }
];

async function seedPlans() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(cleanMongoUri);
    console.log('Connected!');

    console.log('Clearing old plans...');
    await PlanModel.deleteMany({});

    console.log('Inserting new plans...');
    for (const plan of plans) {
      await PlanModel.create(plan);
      console.log(`- Created plan: ${plan.name}`);
    }

    console.log('Success! Dynamic pricing plans added.');
  } catch (err) {
    console.error('Error seeding plans:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedPlans();
