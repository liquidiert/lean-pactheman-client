using System;

namespace GameDataParser {

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

        public static Position Normalize(this Position pos) {
            pos.Divide(Math.Sqrt(Math.Pow(pos.X, 2) + Math.Pow(pos.Y, 2)));
            pos.Round();
            return pos;
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

        public static double Distance(this Position pos, Position toCompare) {
            return Math.Sqrt((pos.X - toCompare.X) * (pos.X - toCompare.X) + (pos.Y - toCompare.Y) * (pos.Y - toCompare.Y));
        }

        public static double ManhattanDistance(this Position pos, Position toCompare) {
            return Math.Abs(pos.X - toCompare.X) + Math.Abs(pos.Y - toCompare.Y);
        }

        public static Position Interpolated(this Position pos, Position other) {
            return new Position {
                X = (pos.X + other.X) / 2,
                Y = (pos.Y + other.Y) / 2
            };
        }

        public static Position Downscaled(this Position pos) {
            return new Position { X = (float)Math.Floor(pos.X / 64), Y = (float)Math.Floor(pos.Y / 64) };
        }

        public static Position Upscaled(this Position pos) {
            return new Position { X = pos.X * 64, Y = pos.Y * 64 };
        }

    }
}