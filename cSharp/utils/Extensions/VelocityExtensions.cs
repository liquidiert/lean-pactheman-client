using System;
using PacTheMan.Models;

namespace lean_pactheman_client {

    public static class VelocityExtensions {

        public static void Print(this Velocity pos) {
            Console.WriteLine($"{pos.X} {pos.Y}");
        }

        public static Position ToPosition(this Velocity velocity) {
            return new Position { X = velocity.X, Y = velocity.Y };
        }

        public static Velocity Normalize(this Velocity velocity) {
            velocity.Divide(Math.Sqrt(Math.Pow(velocity.X, 2) + Math.Pow(velocity.Y, 2)));
            velocity.Round();
            return velocity;
        }

        public static Velocity AddOther(this Velocity selfPos, Velocity other) {
            selfPos.X += other.X;
            selfPos.Y += other.Y;
            return selfPos;
        }

        public static Velocity Add(this Velocity selfPos, int toAdd) {
            selfPos.X += toAdd;
            selfPos.Y += toAdd;
            return selfPos;
        }

        public static Velocity SubOther(this Velocity selfPos, Velocity other) {
            selfPos.X -= other.X;
            selfPos.Y -= other.Y;
            return selfPos;
        }

        public static Velocity Sub(this Velocity selfPos, int toSub) {
            selfPos.X -= toSub;
            selfPos.Y -= toSub;
            return selfPos;
        }

        public static Velocity Sub(this Velocity selfPos, float toMultiply) {
            selfPos.X -= (int)Math.Ceiling(toMultiply);
            selfPos.Y -= (int)Math.Ceiling(toMultiply);
            return selfPos;
        }

        public static Velocity Sub(this Velocity selfPos, double toMultiply) {
            selfPos.X -= (int)Math.Ceiling(toMultiply);
            selfPos.Y -= (int)Math.Ceiling(toMultiply);
            return selfPos;
        }

        public static Velocity Multiply(this Velocity selfPos, int toMultiply) {
            selfPos.X *= toMultiply;
            selfPos.Y *= toMultiply;
            return selfPos;
        }

        public static Velocity Multiply(this Velocity selfPos, float toMultiply) {
            selfPos.X *= toMultiply;
            selfPos.Y *= toMultiply;
            return selfPos;
        }

        public static Velocity Multiply(this Velocity selfPos, double toMultiply) {
            selfPos.X *= (float)toMultiply;
            selfPos.Y *= (float)toMultiply;
            return selfPos;
        }

        public static Velocity Divide(this Velocity selfPos, float toMultiply) {
            selfPos.X /= toMultiply;
            selfPos.Y /= toMultiply;
            return selfPos;
        }

        public static Velocity Divide(this Velocity selfPos, double toMultiply) {
            selfPos.X /= (float)toMultiply;
            selfPos.Y /= (float)toMultiply;
            return selfPos;
        }

        public static Velocity Round(this Velocity pos) {
            pos.X = (float)Math.Round(pos.X);
            pos.Y = (float)Math.Round(pos.Y);
            return pos;
        }

        public static Velocity Floor(this Velocity pos) {
            pos.X = (float)Math.Floor(pos.X);
            pos.Y = (float)Math.Floor(pos.Y);
            return pos;
        }

        public static double Distance(this Velocity velocity, Velocity toCompare) {
            return Math.Sqrt((velocity.X - toCompare.X) * (velocity.X - toCompare.X) + (velocity.Y - toCompare.Y) * (velocity.Y - toCompare.Y));
        }

    }
}