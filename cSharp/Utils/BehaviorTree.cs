using System;
using System.Collections.Generic;

namespace lean_pactheman_client {

    public abstract class BehaviorTask {
        public List<BehaviorTask> Children = new List<BehaviorTask>();
        public abstract bool Run();
        public void Print(int indent = 0) {
            for (int i = 0; i < indent; i++) {
                Console.Write(" ");
            }
            if (this.GetType() == typeof(Selector)) {
                Console.WriteLine($"Select the first successful out of {Children.Count} children:");
            } else if (this.GetType() == typeof(Sequence)) {
                Console.WriteLine($"Execute {Children.Count} children in sequence:");
            } else if (this.GetType() == typeof(Condition)) {
                var repr = (this as Condition).EvaluationRepresentation;
                if (repr.Contains("<") || repr.Contains(">")) {
                    repr = "anonymous function";
                }
                Console.WriteLine($"Condition: {repr}");
            } else if (this.GetType() == typeof(Action)) {
                var repr = (this as Action).ActionRepresentation;
                if (repr.Contains("<") || repr.Contains(">")) {
                    repr = "anonymous function";
                }
                Console.WriteLine($"Action: {repr}");
            } else { // generic task
                Console.WriteLine($"Generic (unknown) Task: {this.GetType()}");
            }
            foreach (var c in Children) {
                c.Print(indent: indent + 2);
            }
        }
    }

    public class Selector : BehaviorTask {
        public override bool Run() {
            foreach (var c in Children) {
                if (c.Run()) {
                    return true;
                }
            }
            return false;
        }
    }

    public class Sequence : BehaviorTask {
        public override bool Run() {
            foreach (var c in Children) {
                if (!c.Run()) {
                    return false;
                }
            }
            return true;
        }
    }

    public class Condition : BehaviorTask {

        Func<bool> evaluation;
        /// <summary>
        /// A string representation of the evaluation.
        /// </summary>
        /// <returns>
        /// The reflected Method of Func evaluation.
        /// </returns>
        public string EvaluationRepresentation {
            get => $"{evaluation.Method}";
        }

        public Condition(Func<bool> e) {
            evaluation = e;
        }
        public override bool Run() {
            return evaluation();
        }

    }

    public class Action : BehaviorTask {
        Func<bool> action;
        /// <summary>
        /// A string representation of the action.
        /// </summary>
        /// <returns>
        /// The reflected Method of Func action.
        /// </returns>
        public string ActionRepresentation {
            get => $"{action.Method}";
        }

        public Action(Func<bool> a) {
            action = a;
        }
        public override bool Run() {
            return action();
        }
    }

    public class BehaviorTree {
        BehaviorTask _rootTask { get; }

        public BehaviorTree(BehaviorTask root) => _rootTask = root;

        public void Run() {
            _rootTask.Run();
        }
        public void Print() {
            _rootTask.Print();
        }
    }

    public class BehaviorTreeBuilder {
        private BehaviorTask _rootNode { get; set; }
        private BehaviorTask _prevNode { get; set; }
        private BehaviorTask _currNode { get; set; }

        public BehaviorTreeBuilder AddSequence(bool nested=true) {
            if (_rootNode == null) {
                _rootNode = new Sequence();
                _prevNode = _currNode = _rootNode;
            } else {
                var newCurr = new Sequence();
                if (!nested) {
                    _prevNode.Children.Add(newCurr);
                } else {
                    _currNode.Children.Add(newCurr);
                    _prevNode = _currNode;
                }
                _currNode = newCurr;
            }
            return this;
        }
        public BehaviorTreeBuilder AddSelector(bool nested=true) {
            if (_rootNode == null) {
                _rootNode = new Selector();
                _prevNode = _currNode = _rootNode;
            } else {
                var newCurr = new Selector();
                if (!nested) {
                    _prevNode.Children.Add(newCurr);
                } else {
                    _currNode.Children.Add(newCurr);
                    _prevNode = _currNode;
                }
                _currNode = newCurr;
            }
            return this;
        }
        public BehaviorTreeBuilder AddCondition(Func<bool> condition) {
            if (_rootNode == null) {
                throw new ArgumentException("Tree must have a composition root.");
            }
            _currNode.Children.Add(new Condition(condition));
            return this;
        }
        public BehaviorTreeBuilder AddAction(Func<bool> action) {
            if (_rootNode == null) {
                throw new ArgumentException("Tree must have a composition root");
            }
            _currNode.Children.Add(new Action(action));
            return this;
        }
        public BehaviorTreeBuilder AddGeneric(BehaviorTask task, bool nested=true) {
            if (_rootNode == null) {
                if (task.GetType() != typeof(Action) || task.GetType() == typeof(Condition)) {
                    _prevNode = _rootNode = task;
                } else {
                    throw new ArgumentException("Tree must have a composition root.");
                }
            } if (!nested) {
                if (task.GetType() == typeof(Action) || task.GetType() == typeof(Condition)) {
                    throw new ArgumentException($"A non-leaf node must be a composition node! At {_currNode.GetType()}");
                }
                _prevNode.Children.Add(task);
            } else {
                _currNode.Children.Add(task);
                _prevNode = _currNode;
            }
            _currNode = task;
            return this;
        }

        public BehaviorTree Build() {
            return new BehaviorTree(_rootNode);
        }
    }
}