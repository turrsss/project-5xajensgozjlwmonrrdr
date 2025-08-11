import { superdevClient } from "@/lib/superdev/client";

export const Payment = superdevClient.entity("Payment");
export const PaymentSetting = superdevClient.entity("PaymentSetting");
export const Question = superdevClient.entity("Question");
export const QuestionPackage = superdevClient.entity("QuestionPackage");
export const QuestionTagStats = superdevClient.entity("QuestionTagStats");
export const TryoutSession = superdevClient.entity("TryoutSession");
export const UserAnswer = superdevClient.entity("UserAnswer");
export const User = superdevClient.auth;
