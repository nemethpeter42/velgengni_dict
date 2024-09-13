import express from 'express';
const router = express.Router();
//TODO !!! .post
router.get('/export_dict_queries', async (req, res) => {
    try {
        /* TODO uncomment
        const reqBody = req.body as {data?: ExportModuleRequest};
        if (reqBody && reqBody.data) {
          const reqData = reqBody.data;
          res.sendStatus(200)
        } else {
          throw Error(`Request body is in incorrect format.`)
        }  */
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error) {
            res.status(400).send(error);
        }
        else {
            res.status(400).send(error);
        }
    }
});
export default router;
