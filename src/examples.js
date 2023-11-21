/**
 * this is my "csv" file for generating example programs.
 */
export const codeText = `

##Example Programs:
## // click on the blue links above to browse
// and try out example code!


##Order of Operations
##// 1. what do you think this will print out?
println "question 1 prints"
println 3 + 4 * 5 > 32 and 1 + 1 == 2

// 2. what do you think this will print out?
println "question 2 prints"
println "1" + 5 + 6


##Variables assignment
##int a = 4
int b = 32
int c = 0
c = a + b
a = b
b = a - c % b
println a
println b
println c


##Scope
##// The output might surprise you
int b = 3
void change( int b)
	b = 100
end change
change(b)
println b


##gcd
##int gcd(int a, int b)
	int temp = b
	while (b≠0)
		b = a % b
		a = temp
	end while
	return a
end gcd
println gcd(21, 35)


##Factorial
##// this function returns the factorial of a number.
int fact(int n)
	if (n < 2)
		return n
	end if
	return n * fact(n - 1)
end fact
// try printing different numbers to test your code!
println fact(5)


##Fibonacci
##int fibonacci(int n)
if (n <= 1)
	return n
else
	return fibonacci(n - 1) + fibonacci(n - 2)
end if
end fibonacci
println fibonacci(10)


##mystery
##//this is from question 12 of the example problems
void mystery(int n)
while (n≠1)
		if (n % 2 == 1)
		n ← 3 * n + 1
	else
		n ← n / 2
	end if
	print n
end while
end mystery
mystery(6)

`;
