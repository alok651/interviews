// 1. First import everything
import { Inngest } from "inngest";  
import { connectDB } from "./db.js";
import User from "../models/User.js";

// 2. Create instance with a unique name
export const inngestClient = new Inngest({ id: "interviews" });

// 3. Create functions using the instance
const syncUser = inngestClient.createFunction(
  { id: "sync-user" },
  { events: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const { id, email_address, first_name, last_name, image_url } = event.data;

    const newUser = {
      clerkId: id,
      email: email_address[0]?.email_address,
      name: `${first_name} ${last_name}`,
      profileImage: image_url
    };

    await User.create(newUser);
  }
);

const deleteUserFromDB = inngestClient.createFunction(
  { id: "delete-user-from-db" },
  { events: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;
    await User.deleteOne({ clerkId: id });
  }
);

// 4. Export functions array
export const functions = [syncUser, deleteUserFromDB];
