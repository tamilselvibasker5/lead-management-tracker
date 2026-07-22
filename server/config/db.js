import mongoose from 'mongoose';
import dns from 'dns';

export const connectDB = async () => {
  try {
    // Override DNS resolver to Google/Cloudflare DNS for MongoDB SRV resolution
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};
