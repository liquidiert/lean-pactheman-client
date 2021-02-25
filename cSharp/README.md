![pactheman_icon](../assets/pactheman_icon.png)
# PacTheMan lean client - C#

This is a modified version of the (fat) [PacTheMan client](https://github.com/liquidiert/pactheman-client) intended to be used as a minimal, extensible communication framework for the [PacTheMan server](https://github.com/liquidiert/pactheman-server).

## Requirements
If you want to use the lean client source files make you have the following requirements:
- dotnet5.0 sdk and runtime; available [here](https://dotnet.microsoft.com/download/dotnet/5.0)
- the PacTheMan map file; which can be found [here](https.//github.com/liquidiert/lean-pactheman-client) as a txt file
  - if you cloned the lean-pactheman-client repository you don't have to do anything
  - otherwise copy the map file to your project directory and change the path in `utils/MapReader.cs`

## Configuration
Per default the lean client tries to connect to a server instance at `127.0.0.0:5387`. Default ip and port can be changed via:
- ip: `--ip 0.0.0.0`
- port: `--port 1234`

Also the default behavior is trying to join a session, in which case the client asks for a SessionId. This can be changed via the `--host` flag.

## Use it
To start the client either:
- execute `dotnet run --playername {your name}`; if you directly use the source
- or execute the *prebuilt binary* with `--playername {your name}` as argument

## Extend it
The lean version of the PacTheMan client is intended to be extended with your own AI implementation to compete against others.  
To do so just add your implementation to the `Interfaces` directory and make sure that it implements the `IMove` interface.  

Here's a sample implementation of an agent that behaves randomly:
```c#
using System;
using System.Collections.Generic;

namespace lean_pactheman_client {

    public class SimpleMoveExample : IMove {

        public Velocity PerformMove(Player player) {

            var velocities = new List<Velocity>().AddMany(
                    new Velocity(-64, 0), // left
                    new Velocity(64, 0), // right
                    new Velocity(0, 64), // up
                    new Velocity(0, -64) // down
                );
            return velocities[new Random().Next(velocities.Count)];

        }
    }
}
```

> After you've added your implementation, exchange `SimpleMoveExample` with your implementations' class name in `MoveAdapter.cs`.

### Game state
The game state — things like the current position of the ghosts or score points — is accessible via the `GameState.Instance`.  
It contains:
- *PlayerState*: `PlayerState`; A separate state class that contains:
  - *Direction*: `MovingState`; The current direction your player is facing to. Changing this is optional and only needed if you wish to see your player facing in the direction if the server is running in GUI mode.
  - *PlayerPositions*: `ConcurrentDictionary<Guid, Position>`; A dictionary consisting of player id and corresponding position
  - *Scores*: `ConcurrentDictionary<Guid, long> Scores`; A dictionary consisting of player id and corresponding score
  - *Lives*: `ConcurrentDictionary<Guid, long> Scores`; A dictionary consisting of player id and corresponding lives
- *ScorePointState*: `ScorePointState`; A separate state class that contains:
  - *ScorePointPositions*: `ConcurrentBag<Position>`; A concurrent bag holding each score point position
- *GhostPositions*: `ConcurrentDictionary`; A dictionary consisting of the ghost name (`string`) as key and its corresponding `Position` as values

### The PlayerInfo class
This is a read-only class containing all important information of your player:
- *Session*: `SessionMsg`; Contains SessionId and ClientId of your player
- *MovementSpeed*: `float`
- *StartPosition*: `Position`
- *Position*: `Position`
- *DownScaledPosition*: `Position`; The current position of the player already down scaled for usage in A*

## Extension Methods
There are some useful extension methods which can be found at `Utils/Extensions`. An example is the extension method `AddMany` for `Lists` that adds many in place created entries.  
Sometimes you have to import `PacTheMan.Models` because some extensions (e.g. for `Position`) are specified in this namespace.

## BehaviorTree builder

### “problematic” configurations
You may want to use deep nested compositions in your behavior tree; the `nested: false` argument won't suffice in a situation like this:  
```c#
builder.AddSequence(nested: false) // #1
    .AddSequence() // #2
        .AddSequence() // #3
    .AddSequence(nested: false) // should be executed after #2 but will be called after #3
```
cause nested only works for compositions that only have actions / conditions as children.  
If you want to continue at a different composition use the anchor and link arguments:  
```c#
builder.AddSequence(nested: false) // #1
    .AddSequence(anchor: 1) // #2
        .AddSequence() // #3
    .AddSequence(link: 1) // now executes after #2
```

Things to now about anchors / links:
- Anchor indices start at 1 (cause 0 is reserved for default nesting)
- Indices **must** be unique
- You can link as many nodes to an anchor as you want
- only compositions support anchors / links (`AddGeneric` ignores the `anchor` argument if `isComposition = false`)