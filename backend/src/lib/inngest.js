import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";

// create Inngest client
export const inngestClient = new Inngest({ id: "interviews" });

// user created
const syncUser = inngestClient.createFunction(
  { id: "sync-user" },
  { events: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();
    const { id, email_address, first_name, last_name, image_url } = event.data;

    await User.create({
      clerkId: id,
      email: email_address?.[0]?.email_address,
      name: `${first_name} ${last_name}`,
      profileImage: image_url
    });
  }
);

// user deleted
const deleteUserFromDB = inngestClient.createFunction(
  { id: "delete-user-from-db" },
  { events: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();
    const { id } = event.data;
    await User.deleteOne({ clerkId: id });
  }
);

export const functions = [syncUser, deleteUserFromDB];
