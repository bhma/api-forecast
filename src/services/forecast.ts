import { ForecastPoint, StormGlass } from "@src/clients/stormGlass";
import logger from "@src/logger";
import { Beach } from "@src/models/beach";
import { InternalError } from "@src/util/errors/internal-error";

export interface TimeForecast {
    time: string;
    forecast: BeachForecast[];
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export class ForecastProcessingInternalError extends InternalError {
    constructor(message: string){
        super(`Unexpected error during the forecast processing: ${message}`);
    }
}

export class Forecast {
    constructor(protected stormGlass = new StormGlass()) {}

    public async processForecastForBeaches(beaches: Beach[]): Promise<TimeForecast[]> {
        const pointsWithCorrectSources: BeachForecast[] = [];
        logger.info(`preparing the forecast for ${beaches.length} beaches.`);
        try {
            for(const beach of beaches){
                const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
                const enrichedBeachData = this.enrichedBeachData(points, beach);
                pointsWithCorrectSources.push(...enrichedBeachData);
            }
            return this.mapForecastbyTime(pointsWithCorrectSources);
        } catch(error){
            logger.error(error);
            throw new ForecastProcessingInternalError((error as Error).message);
        }
    }

    private enrichedBeachData(points: ForecastPoint[], beach: Beach): BeachForecast[]{
        return points.map((point) => ({
            ...{},
            ...{
                lat: beach.lat,
                lng: beach.lng,
                name: beach.name,
                position: beach.position,
                rating: 1
            },
            ...point
        }));
    }

    private mapForecastbyTime(forecast: BeachForecast[]): TimeForecast[] {
        const forecastByTime: TimeForecast[] = [];
        for(const point of forecast){
            const timePoint = forecastByTime.find((f) => f.time === point.time);
            if(timePoint){
                timePoint.forecast.push(point);
            } else {
                forecastByTime.push({
                    time: point.time,
                    forecast: [point]
                });
            }
        }
        return forecastByTime;
    }
}