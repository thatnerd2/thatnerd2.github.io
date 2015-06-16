ArrayList<Float> radii;
ArrayList<Float> x;
ArrayList<Float> y;

void setup () {
  size(800, 600);
  radii = new ArrayList<Float>();
  x = new ArrayList<Float>();
  y = new ArrayList<Float>();
}

void draw () {
  background(255);
  if (mousePressed) {
    radii.add((float) 1.0);
    x.add((float) mouseX);
    y.add((float) mouseY);
  }
  
  for (int i = 0; i < radii.size(); i++) {
    ellipse(x.get(i), y.get(i), radii.get(i), radii.get(i));
    radii.set(i, radii.get(i)*1.1);
    if (radii.get(i) > 800) {
      radii.remove(i);
      x.remove(i);
      y.remove(i);
    }
    
    
  }
}
