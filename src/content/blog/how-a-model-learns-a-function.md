---
title: 'How a model learns a function'
description: 'The intuition behind the animation on my homepage fitting a curve to points with gradient descent.'
date: 2026-07-02
tags: ['machine-learning', 'intuition']
---

If you've seen the animation on my homepage, you've watched a small model *learn*
a function in real time: a smooth curve slowly bending to fit scattered points.
Here's the intuition behind it.

## Points, and a curve that wants to fit them

We start with some data points. Each is a pair `(x, y)`. Our goal is to find a
function `f` such that `f(x)` is close to `y` for every point and ideally
generalises to inputs we haven't seen.

The model I use is a small **radial-basis-function** regressor: a weighted sum of
smooth "bumps" spread across the input range. By turning the weights up and down,
we can shape a surprisingly flexible curve.

## Learning = reducing error

To measure how wrong the curve is, we use the **mean squared error**:

```text
loss = average over points of (f(x) - y)²
```

Then we nudge each weight in the direction that reduces this error a little at a
time. That's **gradient descent**. Repeat thousands of times per second and the
curve appears to flow into place.
