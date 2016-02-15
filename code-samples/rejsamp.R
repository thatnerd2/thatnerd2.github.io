target = function (x) { dbeta(x, 10, 20) }


rejectionSample = function (n, f, x.interval = c(0, 1), upper.bound = function (x) { 10 }) {
  # n is the number of points wanted
  # f is the target distribution
  # x.interval is the A,B range of x values possible.
  # upper.bound is the high bound of the rejection sampler.  Notice
  #   that the input is a function so you can use a rnorm or something if you'd like.
  
  pts = vector("numeric", n)  # This vector will hold our points.
  ix = 1                      # This is our current position in the pts array
  
  while (ix < n) {
    x = runif(1, x.interval[1], x.interval[2]) # Take a random x value.
    y = runif(1, 0, upper.bound(x))             # Take a random y value
    if (f(x) >= y) {
      if (x < 0.1) print(paste("Accept ", x, y))
      pts[ix] = x
      ix = ix + 1
    }
  }
  
  return(pts)
}

points = rejectionSample(n = 10000, target, upper.bound = function (x) { 6 })
curve(target, from = 0, to = 1, ylab="Probability density", main="Rejection Sampling on Beta(10, 20)")
lines(density(points), col="green")