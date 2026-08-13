# Linux navigation

## Your location gives paths meaning

The shell always has a working directory. A relative path is interpreted from that location. An absolute path begins at the filesystem root. Many missing-file errors happen because the file is real, but the command is looking from the wrong context.

## Absolute versus relative

An absolute path states the full route from the root slash. A relative path states the route from where you are now. Relative paths are shorter and portable inside a project, but they only work when the starting context is correct.

## Print, list, then move

Use p w d to print your location, l s to inspect what is available, and c d to change directories. After moving, print the location again. This sequence turns an assumed path into observable evidence.

## Check context before syntax

When a file cannot be found, do not repeatedly rewrite the command. Confirm the working directory, list the expected parent folder, and verify each part of the path. If needed, search within the project rather than across the whole system.

## Location is part of the command

Navigation is not separate from analysis. Your working directory determines how relative paths are interpreted. Print the context, inspect the route, and move deliberately so every later FSL command acts on the intended data.
