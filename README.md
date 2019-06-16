# harpoon

This is a VSCode extension that monitors the main process
of an active DebugSession for spawned child processes.
Once a child process is identified, an attempt will be
made to attach a new DebugSession to that child process.
If source code is available in the current workspace,
the attach will succeed and the child process can be
stepped through.

# Purpose

This extension is really useful for applications that
spawn child processes.  Take the following C# code for
example:

```
static void Main(string[] args) {
    ...

    var p = Process.Start("node", "index.js");

    p.WaitForExit();

    ...
}
```

Normally, in order to debug the node process you would need
to sleep the current thread and manually attach the debugger.
Harpoon will discreetly check for the system for child processes every second.

# Install

- Search for 'harpoon' on the marketplace; or
- Download the harpoon-x.x.x.vsix file to install manually.

# Limitations

- Only tested with a .NET Core parent process
- Only tested with .NET Core and NodeJS child processes

# Usage

1. Add a breakpoint to your child application
2. Start a debug session
3. Wait for Harpoon to identify the spawned process and
   attach the debugger

Using the VSCode Debug control overlay, you can move
between active debug sessions by selecting from the
dropdown on the right side.  This also applied to other
VSCode tool windows like Output and Debug Console.

# Issues




