export const swapFirstCharCase = (str: string): string =>
	(
		str.charAt(0).toLowerCase()===str.charAt(0)?
		str.charAt(0).toUpperCase():
		str.charAt(0).toLowerCase()
	) + str.substring(1)
