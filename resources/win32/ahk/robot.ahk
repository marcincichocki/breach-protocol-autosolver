if (A_Args[1] = move) {
	MouseMove, A_Args[2], A_Args[3], 0
}

if (A_Args[1] = send) {
	SendInput, A_Args[2]
}