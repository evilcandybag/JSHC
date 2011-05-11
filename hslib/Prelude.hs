
module Prelude where

import Data.Int

--------------------------------------------------------------------------------
-- booleans

data Bool = True | False
 -- deriving (Eq, Ord, Enum, Read, Show, Bounded)

(&&), (||) :: Bool -> Bool -> Bool
infixr 3 &&
infixr 2 ||
True  && x =  x
False && x =  False
True  || x =  True
False || x =  x

not :: Bool -> Bool
not True  = False
not False = True

otherwise :: Bool
otherwise = True

--------------------------------------------------------------------------------

data Maybe a = Nothing | Just a
 -- deriving (Eq, Ord, Read, Show)

data Either a b = Left a | Right b
 -- deriving (Eq, Ord, Read, Show)

--------------------------------------------------------------------------------
-- arithmetic operators

infixl 7 *, /
infixl 6 +, -
(+) = JSHC.Internal.Prelude.int32add
(-) = JSHC.Internal.Prelude.int32sub
(*) = JSHC.Internal.Prelude.int32mul
(/) = JSHC.Internal.Prelude.int32div

-- arithmetic comparisons
infix 4 < , > , <= , >= , == , /=
(<)  = JSHC.Internal.Prelude.int32lt
(>)  = JSHC.Internal.Prelude.int32gt
(<=) = JSHC.Internal.Prelude.int32le
(>=) = JSHC.Internal.Prelude.int32ge
(==) = JSHC.Internal.Prelude.int32eq
(/=) = JSHC.Internal.Prelude.int32ne

--------------------------------------------------------------------------------
-- functions

id :: a -> a
id x = x

(.) :: (b -> c) -> (a -> b) -> a -> c
f . g = \ x -> f (g x)

flip :: (a -> b -> c) -> b -> a -> c
flip f x y = f y x

infixr 0 $
($) :: (a -> b) -> a -> b
f $ x = f x

--------------------------------------------------------------------------------
-- list functions

--map :: (a -> b) -> [a] -> [b]
--map f []     = []
map f ((:) x xs) = f x : map f xs

--infixr 5 ++
-- (++) :: [a] -> [a] -> [a]
-- []     ++ ys = ys
-- (x:xs) ++ ys = x : (xs ++ ys)

--filter :: (a -> Bool) -> [a] -> [a]
--filter p []                 = []
--filter p (x:xs) | p x       = x : filter p xs
--                | otherwise = filter p xs

--concat :: [[a]] -> [a]
--concat xss = foldr (++) [] xss

--concatMap :: (a -> [b]) -> [a] -> [b]
--concatMap f = concat . map f

--head       :: [a] -> a
--head ((:) x _) = x
--head []        = error "Prelude.head: empty list"

--tail        :: [a] -> [a]
--tail (_:xs) = xs
--tail []     = error "Prelude.tail: empty list"

--last        :: [a] -> a
--last [x]    =  x
--last (_:xs) =  last xs
--last []     =  error "Prelude.last: empty list"

--init        :: [a] -> [a]
--init [x]    =  []
--init (x:xs) =  x : init xs
--init []     =  error "Prelude.init: empty list"

--null        :: [a] -> Bool
--null []     = True
--null (_:_)  = False

-- length returns the length of a finite list as an Int.
--length           :: [a] -> Int
--length []        = 0
--length (_:l)     = 1 + length l

-- List index (subscript) operator, 0-origin
--(!!)                :: [a] -> Int -> a
--xs     !! n | n < 0 = error "Prelude.!!: negative index"
--[]     !! _         = error "Prelude.!!: index too large"
--(x:_) !! 0          = x
--(_:xs) !! n         = xs !! (n-1)

--foldl            :: (a -> b -> a) -> a -> [b] -> a
--foldl f z []     = z
--foldl f z (x:xs) = foldl f (f z x) xs

--foldl1           :: (a -> a -> a) -> [a] -> a
--foldl1 f (x:xs)  = foldl f x xs
--foldl1 _ []      = error "Prelude.foldl1: empty list"

--scanl            :: (a -> b -> a) -> a -> [b] -> [a]
--scanl f q xs     = q : (case xs of
--                            []   -> []
--                            x:xs -> scanl f (f q x) xs)


--scanl1          :: (a -> a -> a) -> [a] -> [a]
--scanl1 f (x:xs) = scanl f x xs
--scanl1 _ []     = []



--foldr             :: (a -> b -> b) -> b -> [a] -> b
--foldr f z []      = z
--foldr f z (x:xs) = f x (foldr f z xs)

--foldr1            ::  (a -> a -> a) -> [a] -> a
--foldr1 f [x]      =   x
--foldr1 f (x:xs)   =   f x (foldr1 f xs)
--foldr1 _ []       =   error "Prelude.foldr1: empty list"

--scanr               :: (a -> b -> b) -> b -> [a] -> [b]
--scanr f q0 []       = [q0]
--scanr f q0 (x:xs) = f x q : qs
--                       where qs@(q:_) = scanr f q0 xs

--scanr1          ::   (a -> a -> a) -> [a] -> [a]
--scanr1 f []     =    []
--scanr1 f [x]    =    [x]
--scanr1 f (x:xs) =    f x q : qs
--                     where qs@(q:_) = scanr1 f xs

--iterate     :: (a -> a) -> a -> [a]
--iterate f x = x : iterate f (f x

--repeat   :: a -> [a]
--repeat x = xs where xs = x:xs

--replicate     :: Int -> a -> [a]
--replicate n x = take n (repeat x)

--cycle    :: [a] -> [a]
--cycle [] = error "Prelude.cycle: empty list"
--cycle xs = xs' where xs' = xs ++ xs'

--take                   :: Int -> [a] -> [a]
--take n _      | n <= 0 =  []
--take _ []              =  []
--take n (x:xs)          =  x : take (n-1) xs

--drop                   ::  Int -> [a] -> [a]
--drop n xs     | n <= 0 =   xs
--drop _ []              =   []
--drop n (_:xs)          =   drop (n-1) xs

--splitAt                   :: Int -> [a] -> ([a],[a])
--splitAt n xs              = (take n xs, drop n xs)

--takeWhile               :: (a -> Bool) -> [a] -> [a]
--takeWhile p []          = []
--takeWhile p (x:xs)
--            | px        =  x : takeWhile p xs
--            | otherwise =  []

--dropWhile               :: (a -> Bool) -> [a] -> [a]
--dropWhile p []          = []
--dropWhile p xs@(x:xs')
--            | px        =  dropWhile p xs'
--            | otherwise =  xs

--span, break             :: (a -> Bool) -> [a] -> ([a],[a])
--span p []            = ([],[])
--span p xs@(x:xs')
--            |px         = (x:ys,zs)
--            | otherwise = ([],xs)
--                           where (ys,zs) = span p xs'

--break p                 =  span (not . p)

--reverse :: [a] -> [a]
--reverse = foldl (flip (:)) []

--and, or :: [Bool] -> Bool
--and     = foldr (&&) True
--or      = foldr (||) False

--any, all :: (a -> Bool) -> [a] -> Bool
--any p    = or . map p
--all p    = and . map p

--infix 4 `elem`, `notElem`
--elem, notElem :: (Eq a) => a -> [a] -> Bool
--elem x        = any (== x)
--notElem x     = all (/= x)

--lookup           :: (Eq a) => a -> [(a,b)] -> Maybe b
--lookup key []    = Nothing
--lookup key ((x,y):xys)
--    | key == x   = Just y
--    | otherwise = lookup key xys

--sum, product :: (Num a) => [a] -> a
--sum          = foldl (+) 0
--product      = foldl (*) 1

--maximum, minimum :: (Ord a) => [a] -> a
--maximum []       = error "Prelude.maximum: empty list"
--maximum xs       = foldl1 max xs

--minimum []       =  error "Prelude.minimum: empty list"
--minimum xs       =  foldl1 min xs

--zip  :: [a] -> [b] -> [(a,b)]
--zip  = zipWith (,)

--zip3 :: [a] -> [b] -> [c] -> [(a,b,c)]
--zip3 = zipWith3 (,,)


--zipWith          :: (a->b->c) -> [a]->[b]->[c]
--zipWith z (a:as) (b:bs)
--                 = z a b : zipWith z as bs
--zipWith _ _ _    = []

--zipWith3         :: (a->b->c->d) -> [a]->[b]->[c]->[d]
--zipWith3 z (a:as) (b:bs) (c:cs)
--                 = z a b c : zipWith3 z as bs cs
--zipWith3 _ _ _ _ = []


--unzip  :: [(a,b)] -> ([a],[b])
--unzip  = foldr (\(a,b) ~(as,bs) -> (a:as,b:bs)) ([],[])

--unzip3 :: [(a,b,c)] -> ([a],[b],[c])
--unzip3 = foldr (\(a,b,c) ~(as,bs,cs) -> (a:as,b:bs,c:cs))
--                ([],[],[])

--------------------------------------------------------------------------------
