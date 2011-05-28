
{-
see Chapter 18 of the Haskell 2010 Language Report
-}

module Data.Int where

data Int32

{-
instance Ord Int32 where
  compare = JSHC.Internal.int32cmp
  (<) = JSHC.Internal.int32lt
  (>=) = JSHC.Internal.int32ge
  (>) = JSHC.Internal.int32gt
  (<=) = JSHC.Internal.int32le
  max = JSHC.Internal.int32max
  min = JSHC.Internal.int32min
-}
