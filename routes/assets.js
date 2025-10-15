const express = require('express');
const { getAssets, getAssetByUID, updateAsset } = require('../controllers/assetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAssets);
router.get('/:uid', getAssetByUID);
router.put('/:uid', updateAsset); // <— add this

module.exports = router;