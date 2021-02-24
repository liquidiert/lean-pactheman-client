# GameData Parser

## Why?

Well if you logged your PacTheMan games you probably want to use them. For training your AI or a decision tree, ....  
The lean client saves its logs as `GameData` bytes in .bopr files; which is nice and all, but we usually can't read bytes ¯\\_(ツ)_/¯ 
Therefore the GameData parser helps to decode .bopr files into digestible `GameData` objects so one can use and analyze them.

## Usage

The public static class `Parser` exposes `Parse` as a static helper method. It parses given .bopr files and returns a `GameData` object. Per default the `Parse` method searches for .bopr files in the default C# directory `lea-pactheman-client/cSharp/GameData`.

`Parse` has two overwrites:
- `Parse(DirectoryInfo)`
- `Parse(FileInfo)`

Those work exactly as expected. Either parse a given directory or a specific file.

Here's an example parsing of the default C# directory:  
```c#
static async Task Main(string[] args) {
    GameData data = await Parser.ParseAsync();
    // print length of contained levels
    Console.WriteLine(data.LevelData.Length);
}
```

## The GameData Object

The `GameData`object consists of a `LevelData` array. Each `LevelData` consists of the winner of the level (a string; either "me" or "opp") and the `TimeStep`s taken in the level as an array. A `TimeStep` consists of:
- `Timestamp: long` the uts in milliseconds when the step was logged.
- `PlayerState: PlayerState` player state of the time step. (see `PlayerState` in Bebop.Schemas for the player state properties)
- `GhostPositions: GhostMoveMsg` the positions of the four ghosts at the time step. This unfortunately is missing sometimes if the messages couldn't be merged :(