// backend/models/Trip.js
import mongoose from 'mongoose';

const TripSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  locations: [String],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.models.Trip || mongoose.model('Trip', TripSchema);