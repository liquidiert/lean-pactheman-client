using System;
using System.Collections.Generic;

namespace GameDataParser {
    public class TreeNode {
        public List<TreeNode> Children = new List<TreeNode>();
        public string Label { get; set; }
        public Position Branch { get; set; }

        public void Print(int indent = 0) {
            for (int i = 0; i < indent; i++) {
                Console.Write(" ");
            }
            Console.WriteLine($"{Branch.X}, {Branch.Y} -> {Label}");
            foreach (var child in Children) {
                child.Print(indent + 4);
            }
        }
    }

    public class Tree {
        public TreeNode Root { get; set; }

        public Tree() {}
        public Tree(TreeNode r) => (Root) = (r);

        public void Print() {
            Root.Print();
        }
    }
}