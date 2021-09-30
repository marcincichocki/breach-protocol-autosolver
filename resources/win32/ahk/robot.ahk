#NoEnv
#NoTrayIcon
SendMode Input
CoordMode, Mouse, Screen

if (A_Args[1] = "move") {
  MouseMove, A_Args[2], A_Args[3], 0
}

if (A_Args[1] = "send") {
  key := A_Args[2]
  Send {%key%}
}

if (A_Args[1] = "click") {
  Click
}

if (A_Args[1] = "reset") {
  MouseMove, -9999, -9999, 0
}

if (A_Args[1] = "activate") {
  WinActivate, Cyberpunk 2077
}

ExitApp
