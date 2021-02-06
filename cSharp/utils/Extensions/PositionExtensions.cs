using System;

namespace PacTheMan.Models {

    public static class PositionExtension {

        public static void Print(this Position pos) {
            Console.WriteLine($"{pos.X} {pos.Y}");
        }

        public static Position Copy(this Position pos) {
            return new Position { X = pos.X, Y = pos.Y };
        }

        /// <summary>
        /// Checks wheter a Position "otherPos" is in range of this position "selfPos"
        /// </summary>
        /// <param name="otherPos">The position to check</param>
        /// <param name="range">Range in which the other position still counts as the same; defaults to 32</param>
        /// <returns>A <c>bool<c/> indicating whether position is in range</returns>
        public static bool IsEqualUpToRange(this Position selfPos, Position otherPos, float range = 32f) {
            return Math.Abs(selfPos.X - otherPos.X) <= range && (Math.Abs(selfPos.Y - otherPos.Y) <= range);
        }

        public static Position Normalize(this Position vector) {
            vector.Divide(Math.Sqrt(Math.Pow(vector.X, 2) + Math.Pow(vector.Y, 2)));
            vector.Round();
            return vector;
        }

        public static Position AddOther(this Position selfPos, Position other) {
            selfPos.X += other.X;
            selfPos.Y += other.Y;
            return selfPos;
        }

        public static Position Add(this Position selfPos, int toAdd) {
            selfPos.X += toAdd;
            selfPos.Y += toAdd;
            return selfPos;
        }

        public static Position SubOther(this Position selfPos, Position other) {
            selfPos.X -= other.X;
            selfPos.Y -= other.Y;
            return selfPos;
        }

        public static Position Sub(this Position selfPos, int toSub) {
            selfPos.X -= toSub;
            selfPos.Y -= toSub;
            return selfPos;
        }

        public static Position Sub(this Position selfPos, float toMultiply) {
            selfPos.X -= (int)Math.Ceiling(toMultiply);
            selfPos.Y -= (int)Math.Ceiling(toMultiply);
            return selfPos;
        }

        public static Position Sub(this Position selfPos, double toMultiply) {
            selfPos.X -= (int)Math.Ceiling(toMultiply);
            selfPos.Y -= (int)Math.Ceiling(toMultiply);
            return selfPos;
        }

        public static Position Multiply(this Position selfPos, int toMultiply) {
            selfPos.X *= toMultiply;
            selfPos.Y *= toMultiply;
            return selfPos;
        }

        public static Position Multiply(this Position selfPos, float toMultiply) {
            selfPos.X *= toMultiply;
            selfPos.Y *= toMultiply;
            return selfPos;
        }

        public static Position Multiply(this Position selfPos, double toMultiply) {
            selfPos.X *= (float)toMultiply;
            selfPos.Y *= (float)toMultiply;
            return selfPos;
        }

        public static Position Divide(this Position selfPos, float toMultiply) {
            selfPos.X /= toMultiply;
            selfPos.Y /= toMultiply;
            return selfPos;
        }

        public static Position Divide(this Position selfPos, double toMultiply) {
            selfPos.X /= (float)toMultiply;
            selfPos.Y /= (float)toMultiply;
            return selfPos;
        }

        public static Position Round(this Position pos) {
            pos.X = (float)Math.Round(pos.X);
            pos.Y = (float)Math.Round(pos.Y);
            return pos;
        }

        public static Position Floor(this Position pos) {
            pos.X = (float)Math.Floor(pos.X);
            pos.Y = (float)Math.Floor(pos.Y);
            return pos;
        }

        public static double Distance(this Position vector, Position toCompare) {
            return Math.Sqrt((vector.X - toCompare.X) * (vector.X - toCompare.X) + (vector.Y - toCompare.Y) * (vector.Y - toCompare.Y));
        }

        public static Position Interpolated(this Position vector, Position other) {
            return new Position {
                X = (vector.X + other.X) / 2,
                Y = (vector.Y + other.Y) / 2
            };
        }

        public static Position Downscaled(this Position pos) {
            return new Position { X = (float)Math.Floor(pos.X / 64), Y = (float)Math.Floor(pos.Y / 64) };
        }

    }
}