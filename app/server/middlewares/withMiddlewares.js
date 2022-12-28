import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { withSecurity } from './withSecurity.js';

export const withMiddlewares = app => {
  app.use(express.static('public'));

  //Request body support
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  //Request cookie support
  app.use(cookieParser());

  app.use(withSecurity);
};
