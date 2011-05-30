module Demo where
import BinTree

ones = 1 : ones
twos = map (\ x -> x+1) ones
l = take 3 twos

fac 0 = 1
fac n = n * fac (n-1)

numbers = [2,4,1]
tree = foldr insert empty numbers
