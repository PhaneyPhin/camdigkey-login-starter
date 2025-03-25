import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import axios from "axios";
import "moment-timezone";
const moment = require("moment");

import { Repository } from "typeorm";
import { parseStringPromise } from "xml2js";
import { ExchangeRateEntity } from "./exchange-rate.entity";

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);

  constructor(
    @InjectRepository(ExchangeRateEntity)
    private readonly exchangeRateRepository: Repository<ExchangeRateEntity>
  ) {}

  private readonly URL = "https://www.nbc.gov.kh/api/exRate.php";

  @Cron("0 0 0 * * *")
  public async handle() {
    try {
      const exchangeRate = await this.getExchangeRate();
      await this.save(exchangeRate);
      console.log("[Info] exchange rate handled");
    } catch (e) {
      console.log(e);
    }
  }

  public async getExchangeRate(): Promise<{ rate: number; date: Date }> {
    try {
      const response = await axios.get(this.URL);
      const xmlData = response.data;

      // Parse the XML response
      const result = await parseStringPromise(xmlData);

      // Navigate to the relevant part of the parsed object
      const exchanges = result?.ExchangeRate?.ex || [];
      const usdExchange = exchanges.find((ex: any) => ex.key[0] === "USD/KHR");

      // Return the average exchange rate for USD to KHR
      if (usdExchange) {
        return {
          date: moment(usdExchange?.date[0], "MM/DD/YYYY").toDate(),
          rate: parseFloat(usdExchange.average[0]),
        };
      }

      throw new NotFoundException("No exchange rate found");
    } catch (error) {
      this.logger.error("Error fetching or parsing exchange rate:", error);
      throw new NotFoundException("No exchange rate found");
    }
  }

  public async save(exchangeRate: ExchangeRateEntity): Promise<void> {
    if (
      !(await this.exchangeRateRepository.countBy({ date: exchangeRate.date }))
    ) {
      await this.exchangeRateRepository.save(exchangeRate);
    }
  }

  public async getExchangeRateOnDate(date: Date | string | null = null) {
    if (!date || date == "") {
      date = moment(new Date()).format("YYYY-MM-DD");
    }

    const exchangeRate = await this.exchangeRateRepository
      .createQueryBuilder("exchange_rate")
      .where("date <= :date", { date: date })
      .orderBy("date", "DESC")
      .getOne();
    return exchangeRate;
  }
}
