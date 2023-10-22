#NoEnv
#NoTrayIcon
CoordMode, Mouse, Relative

if (A_Args[1] = "move") {
  MouseMove, A_Args[2], A_Args[3], 0
}

if (A_Args[1] = "send") {
  key := A_Args[2]
  SendInput {%key%}
}

if (A_Args[1] = "click") {
  Click
}

if (A_Args[1] = "reset") {
  MouseMove, 9999, 9999
}

if (A_Args[1] = "activate") {
  WinActivate, Cyberpunk 2077
}

ExitApp
