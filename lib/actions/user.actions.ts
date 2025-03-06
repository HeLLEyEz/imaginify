"use server";

import { revalidatePath } from "next/cache";

import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { clerkClient } from "@clerk/nextjs/server";

// CREATE
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    const newUser = await User.create(user);

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

// READ
export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      // If user not found, try to get user data from Clerk and create them
      try {
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(userId);
        if (clerkUser) {
          const newUser = {
            clerkId: userId,
            email: clerkUser.emailAddresses[0].emailAddress,
            username: clerkUser.username || '',
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
            photo: clerkUser.imageUrl,
          };
          return await createOrGetUser(newUser);
        }
      } catch (clerkError) {
        console.error("Failed to fetch user from Clerk:", clerkError);
        throw new Error("User not found");
      }
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

// CREATE OR GET USER
export async function createOrGetUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    // Check if user exists
    let existingUser = await User.findOne({ clerkId: user.clerkId });

    if (existingUser) {
      return JSON.parse(JSON.stringify(existingUser));
    }

    // If user doesn't exist, create new user
    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

// UPDATE
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error("User update failed");
    
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

// DELETE
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}

// USE CREDITS
export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDatabase();

    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { creditBalance: creditFee }},
      { new: true }
    )

    if(!updatedUserCredits) throw new Error("User credits update failed");

    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    handleError(error);
  }
}