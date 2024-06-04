import requests
import time
from datetime import datetime
import pandas as pd
from csv import writer
import os
import geopandas as gpd
from shapely.geometry import LineString
import osmnx as ox


def extract_link_and_subsegment_info(data, all_link_path, all_subsegment_path):
    all_links = pd.DataFrame(
        [[-1, -1, -1, -1, -1, -1, -1, -1]],
        columns=[
            "road_name",
            "road_id",
            "link_id",
            "start_lat",
            "start_lng",
            "end_lat",
            "end_lng",
            "link_length",
        ],
    )
    all_subsegments = pd.DataFrame(
        [[-1, -1, -1, -1, -1, -1, -1, -1, -1]],
        columns=[
            "road_name",
            "road_id",
            "segment_length",
            "speed",
            "uncapped_speed",
            "free_flow_speed",
            "jam_factor",
            "confidence",
            "traversability",
        ],
    )

    new_row = [-1, -1, -1, -1, -1, -1, -1, -1]
    new_segment_row = [-1, -1, -1, -1, -1, -1, -1, -1, -1]
    road_id = -1
    link_id = -1
    for i in data.json()["results"]:
        # print(i['location']['shape'].keys())
        road_id += 1
        link_id = -1

        for j in i["location"]["shape"]["links"]:
            new_row = [-1, -1, -1, -1, -1, -1, -1, -1]
            link_id += 1
            if "description" in i["location"].keys():
                new_row[0] = i["location"]["description"]
            new_row[1] = road_id
            new_row[2] = link_id
            new_row[3] = j["points"][0]["lat"]
            new_row[4] = j["points"][0]["lng"]
            new_row[5] = j["points"][1]["lat"]
            new_row[6] = j["points"][1]["lng"]
            new_row[7] = j["length"]
            # print(new_row)
            all_links.loc[len(all_links)] = new_row

        if "subSegments" in i["currentFlow"].keys():
            for k in i["currentFlow"]["subSegments"]:
                # print(k)
                new_segment_row = [-1, -1, -1, -1, -1, -1, -1, -1, -1]
                if "description" in i["location"].keys():
                    new_segment_row[0] = i["location"]["description"]
                new_segment_row[1] = road_id
                if "length" in k.keys():
                    new_segment_row[2] = k["length"]
                if "speed" in k.keys():
                    new_segment_row[3] = k["speed"]
                if "speedUncapped" in k.keys():
                    new_segment_row[4] = k["speedUncapped"]
                if "freeFlow" in k.keys():
                    new_segment_row[5] = k["freeFlow"]
                if "jamFactor" in k.keys():
                    new_segment_row[6] = k["jamFactor"]
                if "confidence" in k.keys():
                    new_segment_row[7] = k["confidence"]
                if "traversability" in k.keys():
                    new_segment_row[8] = k["traversability"]
                all_subsegments.loc[len(all_subsegments)] = new_segment_row

    all_links = all_links[1:]
    all_subsegments = all_subsegments[1:]

    # all_links.to_csv(all_link_path, encoding="utf-8", index=False)
    # all_subsegments.to_csv(all_subsegment_path, encoding="utf-8", index=False)

    return all_links, all_subsegments


def extract_road_info(data, all_road_path):
    all_roads = pd.DataFrame(
        [[-1, -1, -1, -1, -1, -1, -1, -1, -1]],
        columns=[
            "road_name",
            "road_length",
            "speed",
            "uncapped_speed",
            "free_flow_speed",
            "jam_factor",
            "confidence",
            "traversability",
            "road_id",
        ],
    )

    road_id = -1
    for i in data.json()["results"]:
        road_id += 1
        new_row = [-1, -1, -1, -1, -1, -1, -1, -1, -1]
        if "description" in i["location"].keys():
            new_row[0] = i["location"]["description"]
        if "length" in i["location"].keys():
            new_row[1] = i["location"]["length"]
        if "speed" in i["currentFlow"].keys():
            new_row[2] = i["currentFlow"]["speed"]
        if "speedUncapped" in i["currentFlow"].keys():
            new_row[3] = i["currentFlow"]["speedUncapped"]
        if "freeFlow" in i["currentFlow"].keys():
            new_row[4] = i["currentFlow"]["freeFlow"]
        if "jamFactor" in i["currentFlow"].keys():
            new_row[5] = i["currentFlow"]["jamFactor"]
        if "confidence" in i["currentFlow"].keys():
            new_row[6] = i["currentFlow"]["confidence"]
        if "traversability" in i["currentFlow"].keys():
            new_row[7] = i["currentFlow"]["traversability"]
        new_row[8] = road_id
        all_roads.loc[len(all_roads)] = new_row
        # print(new_row)
    all_roads = all_roads[1:]
    # print(all_roads.shape)
    # all_roads.to_csv(all_road_path, encoding="utf-8", index=False)

    return all_roads


# gDu0yX1TkZ6fHffObJ5zoEP-FifYhnGza2yJMr3Gj8Q
# Chen: bCXbRzxGSoPRQ9ybeuK95kmSCaDtuGSmVNTVA6v45Jg
link_ = "https://data.traffic.hereapi.com/v7/flow?in=bbox:-76.895596,39.156623,-76.287689,39.721302&locationReferencing=shape&apiKey=gDu0yX1TkZ6fHffObJ5zoEP-FifYhnGza2yJMr3Gj8Q"
while True:
    start_time = time.time()
    this_moment = datetime.today().strftime("%Y-%m-%d-%H-%M-%S")
    print_this = "collecting data at " + this_moment + "   ......"
    print(print_this)
    # print(link_)
    data = requests.get(link_)
    all_link_path = "./traffic_flow_data_baltimore/" + this_moment + "_link_info.csv"
    all_road_path = "./traffic_flow_data_baltimore/" + this_moment + "_road_info.csv"
    all_subsegment_path = (
        "./traffic_flow_data_baltimore/" + this_moment + "_subsegment_info.csv"
    )
    # _, link, subsegment = extract_link_and_subsegment_info(data, all_link_path, all_subsegment_path)
    x = extract_link_and_subsegment_info(data, all_link_path, all_subsegment_path)
    # print("all_links and all_subsegments",x)
    # _, link,subsegment = x
    # print("link", x[0])
    link = x[0]
    # print("subsegment", x[1])
    subsegment = x[1]
    # print("link and subsegment",x)
    # print("all_links and all_subsegments",link, subsegment)

    # _, road = extract_road_info(data, all_road_path)
    x = extract_road_info(data, all_road_path)
    # _, road = x
    # print("all_roads!!!!!",x)
    # print("road", x)
    road = x
    # print("all_roads!!!!!",road)

    output_dir = f"baltimore_merged/{this_moment[:-9]}"
    os.makedirs(output_dir, exist_ok=True)

    # Define the directory paths
    # test with the added "a"
    data_dir = "data"

    # Create the 'data' directory if it doesn't exist
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)

    # Extract year, month, and date from this_moment
    year_dir = this_moment[0:4]
    month_dir = this_moment[5:7]
    date_dir = this_moment[8:10]

    # Create the year directory within the 'data' directory if it doesn't exist
    year_dir_path = os.path.join(data_dir, year_dir)
    if not os.path.exists(year_dir_path):
        os.makedirs(year_dir_path)

    # Create the month directory within the year directory if it doesn't exist
    month_dir_path = os.path.join(year_dir_path, month_dir)
    if not os.path.exists(month_dir_path):
        os.makedirs(month_dir_path)

    # Create the date directory within the month directory if it doesn't exist
    date_dir_path = os.path.join(month_dir_path, date_dir)
    if not os.path.exists(date_dir_path):
        os.makedirs(date_dir_path)

    # Directory for GeoJSON files
    geojson_output_dir = date_dir_path
    os.makedirs(geojson_output_dir, exist_ok=True)

    city = ox.geocode_to_gdf("Baltimore, MD, USA")

    link = link.merge(road, on="road_id")
    link["cumsum_length"] = link.groupby(["road_id"])["link_length"].cumsum()
    subsegment["cumsum_ub"] = subsegment.groupby(["road_id"])["segment_length"].cumsum()
    subsegment["cumsum_lb"] = subsegment.groupby("road_id")["cumsum_ub"].shift(1)
    subsegment["cumsum_lb"] = subsegment["cumsum_lb"].fillna(0)

    for _, segment in subsegment.iterrows():
        conditions = (
            (link["road_id"] == segment["road_id"])
            & (link["cumsum_length"] >= segment["cumsum_lb"])
            & (link["cumsum_length"] <= segment["cumsum_ub"])
        )
        for column in [
            "speed",
            "uncapped_speed",
            "free_flow_speed",
            "jam_factor",
            "confidence",
            "traversability",
        ]:
            link.loc[conditions, column] = segment[column]
    link_file = this_moment + "_link_info.csv"
    output_filename = os.path.join(
        output_dir, os.path.basename(link_file.replace("_link_info", ""))
    )
    link.to_csv(output_filename, encoding="utf-8", index=False)

    # Convert to GeoJSON
    if (
        "start_lat" in link.columns
        and "start_lng" in link.columns
        and "end_lat" in link.columns
        and "end_lng" in link.columns
    ):
        geometry = [
            LineString(
                [(row["start_lng"], row["start_lat"]), (row["end_lng"], row["end_lat"])]
            )
            for idx, row in link.iterrows()
        ]
        link["geometry"] = geometry
        gdf = gpd.GeoDataFrame(link, geometry="geometry")
        gdf.set_crs("EPSG:4326", inplace=True)
        # print(gdf.crs)

        # gdf_clipped = gpd.clip(gdf, city)
        gdf_clipped = gdf

        # Specify columns to include in the GeoJSON, adjust as needed
        gdf_clipped = gdf_clipped[
            [
                "geometry",
                "jam_factor",
                "speed",
                "uncapped_speed",
                "free_flow_speed",
                "confidence",
                "traversability",
            ]
        ]  # Adjust based on the columns you want to include

        geojson_filename = os.path.basename(
            link_file.replace("_link_info.csv", ".geojson")
        )
        gdf_clipped.to_file(
            os.path.join(geojson_output_dir, geojson_filename), driver="GeoJSON"
        )

    # list_file_name = []
    # list_file_name = [all_link_path, all_road_path, all_subsegment_path]
    # with open(
    #     "./traffic_flow_data_baltimore/file_path.csv", "a", newline=""
    # ) as f_object:
    #     writer_object = writer(f_object)
    #     writer_object.writerow(list_file_name)
    #     f_object.close()
    # end_time = time.time()
    # sleep_time = 300 - (end_time - start_time)
    # if sleep_time < 0:
    #     sleep_time = 0
    # time.sleep(sleep_time)
    # except:
    # print("problem with script or mannual exit")
