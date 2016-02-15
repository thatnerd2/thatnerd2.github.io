target = function (x) { dnorm(x, 10, 2) }

sliceSample = function (n, f, x.interval = c(0, 1), root.accuracy = 0.01) {
  # n is the number of points wanted
  # f is the target distribution
  # x.interval is the A,B range of x values possible.
  
  pts = vector("numeric", n)  # This vector will hold our points.
  x = runif(1, x.interval[1], x.interval[2]) # Take a random starting x value.
  
  for (i in 1:n) {
    pts[i] = x
    y = runif(1, 0, f(x))    # Take a random y value
    
    # Imagine a horizontal line across the distribution.
    # Find intersections across that line.
    fshift = function (x) { f(x) - y }
    roots = c()
    for (j in seq(x.interval[1], x.interval[2] - root.accuracy, by = root.accuracy)) {
      if ((fshift(j) < 0) != (fshift(j + root.accuracy) < 0)) {
        # Signs don't match, so we have a root.
        root = uniroot(fshift, c(j, j + root.accuracy))$root
        roots = c(roots, root)
      }
    }
    # Include the endpoints of the interval.
    roots = c(x.interval[1], roots, x.interval[2])
    
    # Divide intersections into line segments.
    segments = matrix(ncol = 2)
    for (j in 1:(length(roots) - 1)) {
      midpoint = (roots[j + 1] + roots[j]) / 2.0
      if (f(midpoint) > y) {
        # Since this line segment is under the curve, add it to segments.
        segments = rbind(segments, c(roots[j], roots[j + 1]))
      }
    }
    
    # Uniformly sample next x from segments
    # Assign each segment a probability, then unif based on those probabilities.
    # This is a bit of a hack because segments first row is NA, NA
    # Yet, subsetting it runs the risk of reducing the matrix to a vector in special case.
    total = sum(sapply(2:nrow(segments), function (i) {
      segments[i, 2] - segments[i, 1]
    }))
    probs = sapply(2:nrow(segments), function (i) {
      (segments[i, 2] - segments[i, 1]) / total
    })
    
    # Assign probabilities to each line segment based on how long it is
    # Select a line segment by index (named seg)
    p = runif(1, 0, 1)
    selectSegment = function (x, i) {
      if (p < x) return(i)
      else return(selectSegment(x + probs[i + 1], i + 1))
    }
    seg = selectSegment(probs[1], 1)
    
    # Uniformly sample new x value
    x = runif(1, segments[seg + 1, 1], segments[seg + 1, 2])
  }
  
  return(pts)
}

points = sliceSample(n = 10000, target, x.interval=c(0, 20), root.accuracy = 0.1)
curve(target, from = 0, to = 20, ylab="Probability density", main="Slice Sampling of Normal(10, 2)")
lines(density(points), col="green")