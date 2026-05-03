const base = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
const symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]

// Converts a number to a Roman numeral string by repeatedly subtracting the largest possible
// symbol from the number, until it reaches zero
export function toRoman(x: number): string {
  let roman = ""

  // Loop through the symbols from largest to smallest
  for (let i = 0; i < base.length && x > 0; i++) {
    // How many times the current symbol can fit into the remaining number
    const div = Math.floor(x / base[i]!)

    // Add that many of the symbol to the result
    for (let j = 0; j < div; j++) {
      roman += symbols[i]
    }

    // Subtract the value of those symbols from the number
    // In this case, getting the remainder is equivalent to subtracting div * base[i] from x
    x %= base[i]!
  }

  return roman
}
