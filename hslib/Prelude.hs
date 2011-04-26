
module Prelude (
  Bool (..),
  Maybe (..),
 ) where

data Bool = True | False
 -- deriving (Eq, Ord, Enum, Read, Show, Bounded)

-- (&&), (||) :: Bool -> Bool -> Bool
-- True  && x =  x
-- False && _ =  False
-- True  || _ =  True
-- False || x =  x

--not :: Bool -> Bool
not True  = False
not False = True

--otherwise :: Bool
otherwise = True


data Maybe a = Nothing | Just a
 -- deriving (Eq, Ord, Read, Show)

data Either a b = Left a | Right b
 -- deriving (Eq, Ord, Read, Show)
