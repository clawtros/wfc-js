const expect = require("chai").expect,
      Bitmap = require('../Bitmap'),
      Model = require('../Model'),
      OverlappingModel = require('../OverlappingModel')

describe('wfc tests', function() {
  it('should pass this canary test', function() {
    expect(true).to.eql(true)
    expect(undefined).to.be.undefined
  })


  describe('model tests', function() {

    it('should not fail with some hypothetically valid parameters', function() {
      const bitmap = Bitmap.bitmapFromFS('samples/Red Maze.png'),
            model = OverlappingModel.createOverlappingModel(bitmap, 2),
            prerun = JSON.stringify(model),
            seed = 1000,
            limit = 100;
      expect(Model.run(model, seed, limit).failed).to.not.be.ok
      
    })

    it('should implement propagate', function() {
      const bitmap = Bitmap.createBitmap(
        [
          1, 2, 3, 4,
          5, 6, 7, 8,
          1, 2, 3, 4,
          5, 6, 7, 8,
        ], 2, 2
      ),
            model = OverlappingModel.createOverlappingModel(bitmap, 2, 2, 2, true, true, 2, 0);
      expect(model.propagate()).not.to.be.undefined
    })


    it('should be able to be observed', function() {
      const bitmap = Bitmap.createBitmap(
        [
          1, 2, 3, 4,
          5, 6, 7, 8,
          1, 2, 3, 4,
          5, 6, 7, 8,
        ], 2, 2
      ),
            model = OverlappingModel.createOverlappingModel(bitmap, 2, 2, 2, true, true, 2, 0);

      expect(Model.observe(model)).to.be.ok
    })
  })

  describe('bitmap tests', function() {
    it('should be able to create a bitmap', function() {
      expect(Bitmap.createBitmap()).to.be.ok
    })

    it('should have a size', function() {
      expect(Bitmap.createBitmap([], 2, 2).width).to.eql(2)
      expect(Bitmap.createBitmap([], 2, 4).height).to.eql(4)
    })

    it('should correctly extract color information', function() {
      expect(Bitmap.createBitmap(
        [1, 2, 3, 4, 5, 6, 7, 8], 1, 2
      ).getColor(0, 0)).to.eql([1, 2, 3, 4])

    })

    it('should store unique colors', function() {
      expect(Bitmap.createBitmap(
        [1, 2, 3, 4, 5, 6, 7, 8], 1, 2
      ).getUniqueColors()).to.eql([[1, 2, 3, 4], [5, 6, 7, 8]])
    })

    it('should correctly index by x', function() {
      expect(Bitmap.createBitmap(
        [1, 2, 3, 4, 5, 6, 7, 8], 2, 1
      ).getColor(1, 0)).to.eql([5, 6, 7, 8])
    })

    it('should correctly index by y', function() {
      expect(Bitmap.createBitmap(
        [1, 2, 3, 4, 5, 6, 7, 8], 1, 2
      ).getColor(0, 1)).to.eql([5, 6, 7, 8])
    })

    it('should load valid bitmaps', function() {
      const bitmap = Bitmap.bitmapFromFS('samples/Chess.png');
      expect(bitmap.getUniqueColors()).to.be.ok
    })

    it('should have a neat ascii representation', function() {
      const bitmap = Bitmap.bitmapFromFS('samples/Rule 126.png'),
            ascii = bitmap.ascii();
      expect(ascii).to.be.ok
    })

  })

})
