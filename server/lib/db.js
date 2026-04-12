import mongoose from 'mongoose';

export const connectDB=async()=>{
    try{ 
        mongoose.connection.once('connected',()=>console.log
        ('database connected'));
        await mongoose.connect(`${process.env.MONGODB_URI}/chitthi`);
    }catch(error){
         console.log(error);
    }
}
