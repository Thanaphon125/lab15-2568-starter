import { Router, type Response, type Request } from "express";
import { courses, students } from "../db/db.js";
import {
  zCourseId,
  zCourseDeleteBody,
  zCoursePostBody,
  zCoursePutBody,
} from "../schemas/courseValidator.js";
import type { Course } from "../libs/types.js";

const router: Router = Router();

// READ all
router.get("/", (req, res) => {
  return res.status(200).json({ success: true, message: "Courses Information", data: courses });
});

// Params URL 
router.get("/:courseId", (req, res) => {
  try {
    const courseId = req.params.courseId;
    const result = zCourseId.safeParse(Number(courseId));

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    const foundIndex = courses.findIndex((course) => course.courseId === Number(courseId));

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Course does not exist",
      });
    }

    res.set("Link", `/api/v2/courses/${courseId}`);
    return res.json({
      success: true,
      message: `Get course ${courseId} successfully`,
      data: courses[foundIndex],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// Post
router.post("/", (req, res) => {
  try {
    const body = req.body as Course;
    const result = zCoursePostBody.safeParse(body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    const found = courses.find((course) => course.courseId === body.courseId);
    if (found) {
      return res.status(409).json({
        success: false,
        message: "Course Id already exists",
      });
    }

    const new_course = body;
    courses.push(new_course);
    res.set("Link", `/api/v2/courses`);
    
    return res.status(201).json({
      success: true,
      message: `Course ${body.courseId} has been added successfully`,
      data: new_course,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// Putt
router.put("/", (req, res) => {
  try {
    const body = req.body as Course;
    const result = zCoursePutBody.safeParse(body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    const foundIndex = courses.findIndex((course) => course.courseId === body.courseId);

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Course Id does not exist",
      });
    }

    courses[foundIndex] = { ...courses[foundIndex], ...body };
    res.set("Link", `/api/v2/courses/${body.courseId}`);
    
    return res.status(200).json({
      success: true,
      message: `Course ${body.courseId} has been updated successfully`,
      data: courses[foundIndex],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// ลบ delete
router.delete("/", (req, res) => {
  try {
    const body = req.body;
    const parseResult = zCourseDeleteBody.safeParse(body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: parseResult.error.issues[0]?.message,
      });
    }

    const foundIndex = courses.findIndex((course) => course.courseId === body.courseId);

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Course Id does not exist",
      });
    }

    courses.splice(foundIndex, 1);
    return res.json({
      success: true,
      message: `Course ${body.courseId} has been deleted successfully`,
      data: courses,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

export default router;
