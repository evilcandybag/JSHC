module BinTree where

data TreeSet a = Leaf | Node a (TreeSet a) (TreeSet a)
--  deriving Show

empty = Leaf

insert x Leaf         = Node x Leaf Leaf
insert x (Node y l r) = 
  if x > y 
    then Node y l (insert x r)
    else if x < y 
      then Node y (insert x l) r 
      else Node y l r
      
{-
contains x Leaf         = False
contains x (Node y l r) = 
  if x == y 
    then True
    else if x > y
      then contains x r
      else contains x l-}
