import * as service from '../services/report.service.js';

export const generate = async (req, res) => res.status(201).json(await service.generateReport(req.body));
export const list = (_req, res) => res.json(service.listReports());
export const getOne = (req, res) => res.json(service.getReport(req.params.id));
export const remove = (req, res) => {
  service.deleteReport(req.params.id);
  res.status(204).end();
};
export const rerun = async (req, res) => res.json(await service.rerunReport(req.params.id));
export const regenerate = async (req, res) => res.json(await service.regenerateReport(req.params.id));
export const analytics = (_req, res) => res.json(service.getAnalytics());
