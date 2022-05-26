#!/bin/bash
osascript -e 'quit app "Ableton Live 10 Suite"';
pkill -9 -x Terminal;
osascript -e 'tell app "Finder" to restart';